#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_JSON_PATH = path.join(ROOT_DIR, 'app.json');
const INFO_PLIST_PATH = path.join(ROOT_DIR, 'ios', 'PixelPaw', 'Info.plist');

const fail = (message) => {
  console.error(`Error: ${message}`);
  process.exit(1);
};

const parseToArg = (args) => {
  const toValueArg = args.find((arg) => arg.startsWith('--to='));
  if (toValueArg) {
    return toValueArg.slice('--to='.length);
  }
  const toIndex = args.findIndex((arg) => arg === '--to');
  if (toIndex >= 0) {
    return args[toIndex + 1];
  }
  return null;
};

const replacePlistString = (plistXml, key, value) => {
  const regex = new RegExp(`(<key>${key}</key>\\s*<string>)([^<]*)(</string>)`);
  if (!regex.test(plistXml)) {
    fail(`Info.plist key not found: ${key}`);
  }
  return plistXml.replace(regex, `$1${value}$3`);
};

const args = process.argv.slice(2);
const toArg = parseToArg(args);

const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));
const currentBuildRaw = appJson?.expo?.ios?.buildNumber;
const appVersion = appJson?.expo?.version;

if (!appVersion || typeof appVersion !== 'string') {
  fail('app.json expo.version must be a non-empty string.');
}

if (!currentBuildRaw || typeof currentBuildRaw !== 'string' || !/^\d+$/.test(currentBuildRaw)) {
  fail('app.json expo.ios.buildNumber must be a numeric string.');
}

const currentBuild = Number.parseInt(currentBuildRaw, 10);
let nextBuild = currentBuild + 1;

if (toArg !== null) {
  if (!toArg || !/^\d+$/.test(toArg)) {
    fail('Invalid --to value. Expected a positive integer.');
  }
  nextBuild = Number.parseInt(toArg, 10);
}

if (!Number.isInteger(nextBuild) || nextBuild <= 0) {
  fail('Next build number must be a positive integer.');
}

if (nextBuild < currentBuild) {
  fail(`Next build number (${nextBuild}) cannot be lower than current (${currentBuild}).`);
}

appJson.expo.ios.buildNumber = String(nextBuild);
fs.writeFileSync(APP_JSON_PATH, `${JSON.stringify(appJson, null, 2)}\n`, 'utf8');

const infoPlistXml = fs.readFileSync(INFO_PLIST_PATH, 'utf8');
let nextPlistXml = replacePlistString(infoPlistXml, 'CFBundleVersion', String(nextBuild));
nextPlistXml = replacePlistString(nextPlistXml, 'CFBundleShortVersionString', appVersion);
fs.writeFileSync(INFO_PLIST_PATH, nextPlistXml, 'utf8');

console.log(
  `Updated iOS build number: ${currentBuild} -> ${nextBuild} (version ${appVersion})`
);
