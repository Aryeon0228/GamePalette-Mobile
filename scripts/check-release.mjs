#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const steps = [
  { name: 'Localization keys', command: 'npm run check:localization' },
  { name: 'Unit tests', command: 'npm test -- --runInBand' },
  { name: 'TypeScript', command: 'npx tsc --noEmit' },
  { name: 'Expo doctor', command: 'npx expo-doctor' },
  { name: 'iOS release guard', command: 'npm run check:ios-release' },
];

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  const result = spawnSync(step.command, {
    shell: true,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\nRelease checks passed.');
