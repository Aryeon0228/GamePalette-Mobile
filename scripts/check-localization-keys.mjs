#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const checks = [
  {
    label: 'Home localization',
    file: 'src/screens/home/homeLocalization.ts',
    mode: 'pair',
    koVar: 'KO_LOCALIZATION',
    enVar: 'EN_LOCALIZATION',
  },
  {
    label: 'Color blindness labels',
    file: 'src/lib/colorUtils.ts',
    mode: 'language-map',
    mapVar: 'COLOR_BLINDNESS_LABELS',
  },
];

function readSourceFile(relativePath) {
  const absolutePath = path.join(ROOT_DIR, relativePath);
  const text = fs.readFileSync(absolutePath, 'utf8');
  const source = ts.createSourceFile(
    absolutePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  return { absolutePath, source };
}

function getPropertyName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return node.text;
  }
  return null;
}

function findObjectLiteralVariable(source, varName) {
  let found = null;
  const visit = (node) => {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === varName) {
      const initializer = node.initializer;
      if (initializer && ts.isObjectLiteralExpression(initializer)) {
        found = initializer;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(source, visit);
  return found;
}

function getNestedObjectLiteral(objectLiteral, key) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = getPropertyName(property.name);
    if (name !== key) continue;
    if (!ts.isObjectLiteralExpression(property.initializer)) {
      return null;
    }
    return property.initializer;
  }
  return null;
}

function collectLeafPaths(objectLiteral, prefix = '', result = new Map(), warnings = []) {
  for (const property of objectLiteral.properties) {
    if (ts.isSpreadAssignment(property)) {
      warnings.push(`Spread is not allowed in localization objects (${property.getText()})`);
      continue;
    }

    if (ts.isPropertyAssignment(property)) {
      const key = getPropertyName(property.name);
      if (!key) {
        warnings.push(`Unsupported property key: ${property.name.getText()}`);
        continue;
      }
      const nextPath = prefix ? `${prefix}.${key}` : key;
      if (ts.isObjectLiteralExpression(property.initializer)) {
        collectLeafPaths(property.initializer, nextPath, result, warnings);
      } else {
        result.set(nextPath, property.initializer);
      }
      continue;
    }

    if (ts.isShorthandPropertyAssignment(property)) {
      const key = property.name.text;
      const nextPath = prefix ? `${prefix}.${key}` : key;
      result.set(nextPath, property);
      continue;
    }

    warnings.push(`Unsupported object member in localization object: ${property.getText()}`);
  }

  return result;
}

function compareLocalization(label, filePath, koObject, enObject) {
  const warnings = [];
  const koLeafMap = collectLeafPaths(koObject, '', new Map(), warnings);
  const enLeafMap = collectLeafPaths(enObject, '', new Map(), warnings);
  const errors = [];

  if (warnings.length > 0) {
    errors.push(...warnings.map((msg) => `${label}: ${msg}`));
  }

  const koKeys = new Set(koLeafMap.keys());
  const enKeys = new Set(enLeafMap.keys());

  for (const key of koKeys) {
    if (!enKeys.has(key)) {
      errors.push(`${label}: missing EN key "${key}" in ${filePath}`);
    }
  }

  for (const key of enKeys) {
    if (!koKeys.has(key)) {
      errors.push(`${label}: missing KO key "${key}" in ${filePath}`);
    }
  }

  for (const [key, valueNode] of koLeafMap) {
    if ((ts.isStringLiteral(valueNode) || ts.isNoSubstitutionTemplateLiteral(valueNode)) && valueNode.text.trim() === '') {
      errors.push(`${label}: KO value is empty for "${key}" in ${filePath}`);
    }
  }

  for (const [key, valueNode] of enLeafMap) {
    if ((ts.isStringLiteral(valueNode) || ts.isNoSubstitutionTemplateLiteral(valueNode)) && valueNode.text.trim() === '') {
      errors.push(`${label}: EN value is empty for "${key}" in ${filePath}`);
    }
  }

  return errors;
}

function runCheck(check) {
  const { absolutePath, source } = readSourceFile(check.file);
  const filePath = path.relative(ROOT_DIR, absolutePath);

  if (check.mode === 'pair') {
    const koObject = findObjectLiteralVariable(source, check.koVar);
    const enObject = findObjectLiteralVariable(source, check.enVar);
    if (!koObject || !enObject) {
      return [`${check.label}: could not find localization objects in ${filePath}`];
    }
    return compareLocalization(check.label, filePath, koObject, enObject);
  }

  if (check.mode === 'language-map') {
    const mapObject = findObjectLiteralVariable(source, check.mapVar);
    if (!mapObject) {
      return [`${check.label}: could not find "${check.mapVar}" in ${filePath}`];
    }
    const koObject = getNestedObjectLiteral(mapObject, 'ko');
    const enObject = getNestedObjectLiteral(mapObject, 'en');
    if (!koObject || !enObject) {
      return [`${check.label}: "${check.mapVar}" must include both ko/en objects in ${filePath}`];
    }
    return compareLocalization(check.label, filePath, koObject, enObject);
  }

  return [`Unsupported check mode "${check.mode}"`];
}

const allErrors = checks.flatMap(runCheck);

if (allErrors.length > 0) {
  console.error('Localization validation failed:');
  for (const error of allErrors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Localization validation passed (ko/en key parity and non-empty labels)');
