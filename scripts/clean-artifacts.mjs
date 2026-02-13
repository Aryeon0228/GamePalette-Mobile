#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

const TARGET_DIRECTORIES = [
  'dist',
  '.expo',
  '.expo-shared',
  'ios/build',
  'android/app/build',
];

const IPA_FILE_PATTERN = /^build-.*\.ipa$/;

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function removeTarget(targetPath, removedPaths) {
  const relPath = path.relative(ROOT_DIR, targetPath) || '.';
  if (!(await exists(targetPath))) {
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] remove ${relPath}`);
    removedPaths.push(relPath);
    return;
  }

  await fs.rm(targetPath, { recursive: true, force: true });
  console.log(`removed ${relPath}`);
  removedPaths.push(relPath);
}

async function cleanBuildIpas(removedPaths) {
  const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
  const ipaFiles = entries
    .filter((entry) => entry.isFile() && IPA_FILE_PATTERN.test(entry.name))
    .map((entry) => path.join(ROOT_DIR, entry.name));

  for (const ipaPath of ipaFiles) {
    await removeTarget(ipaPath, removedPaths);
  }
}

async function main() {
  const removedPaths = [];

  for (const directory of TARGET_DIRECTORIES) {
    await removeTarget(path.join(ROOT_DIR, directory), removedPaths);
  }

  await cleanBuildIpas(removedPaths);

  if (removedPaths.length === 0) {
    console.log('No artifact targets found. Workspace is already clean.');
    return;
  }

  console.log(
    `${dryRun ? 'Dry run complete' : 'Artifact cleanup complete'}: ${removedPaths.length} target(s).`
  );
}

main().catch((error) => {
  console.error('Artifact cleanup failed:', error);
  process.exit(1);
});
