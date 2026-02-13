#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_JSON_PATH = path.join(ROOT_DIR, 'app.json');
const IOS_INFO_PLIST_PATH = path.join(ROOT_DIR, 'ios', 'PixelPaw', 'Info.plist');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const readPlistValue = (xml, key) => {
  const keyPattern = `<key>${escapeRegExp(key)}</key>`;
  const valuePattern = '<string>([^<]+)</string>';
  const regex = new RegExp(`${keyPattern}\\s*${valuePattern}`);
  const match = xml.match(regex);
  return match?.[1] ?? null;
};

const fail = (messages) => {
  for (const message of messages) {
    console.error(`- ${message}`);
  }
  process.exit(1);
};

const appJson = readJson(APP_JSON_PATH);
const appVersion = appJson?.expo?.version;
const appBuildNumber = appJson?.expo?.ios?.buildNumber;

const plistXml = fs.readFileSync(IOS_INFO_PLIST_PATH, 'utf8');
const plistVersion = readPlistValue(plistXml, 'CFBundleShortVersionString');
const plistBuildNumber = readPlistValue(plistXml, 'CFBundleVersion');

const errors = [];

if (!appVersion || typeof appVersion !== 'string') {
  errors.push('app.json: expo.version must be a non-empty string.');
}

if (!appBuildNumber || typeof appBuildNumber !== 'string') {
  errors.push('app.json: expo.ios.buildNumber must be a non-empty string.');
}

if (typeof appBuildNumber === 'string' && !/^\d+$/.test(appBuildNumber)) {
  errors.push('app.json: expo.ios.buildNumber must be numeric (string digits).');
}

if (!plistVersion) {
  errors.push('Info.plist: CFBundleShortVersionString is missing.');
}

if (!plistBuildNumber) {
  errors.push('Info.plist: CFBundleVersion is missing.');
}

if (appVersion && plistVersion && appVersion !== plistVersion) {
  errors.push(
    `Version mismatch: app.json expo.version (${appVersion}) != Info.plist CFBundleShortVersionString (${plistVersion}).`
  );
}

if (appBuildNumber && plistBuildNumber && appBuildNumber !== plistBuildNumber) {
  errors.push(
    `Build mismatch: app.json expo.ios.buildNumber (${appBuildNumber}) != Info.plist CFBundleVersion (${plistBuildNumber}).`
  );
}

if (errors.length > 0) {
  console.error('iOS release guard failed:');
  fail(errors);
}

console.log(
  `iOS release guard passed (version ${appVersion}, build ${appBuildNumber})`
);
