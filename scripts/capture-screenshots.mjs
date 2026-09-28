#!/usr/bin/env node

// Captures App Store screenshots (iPhone 6.9", 1320x2868 JPEG) on an iOS
// simulator by running .maestro/screenshots.yaml once per language.
//
//   npm run screenshots                           # latest EAS "screenshots" build, ko + en
//   npm run screenshots -- --app path/to/PixelPaw.app   # or a .tar.gz from EAS
//   npm run screenshots -- --langs en --no-erase
//
// Input photos:  screenshots/photos/<slot>.jpg (see PHOTO_SLOTS)
// Output:        screenshots/appstore/<lang>/*.jpg

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'screenshots');
const PHOTOS_DIR = path.join(SCREENSHOTS_DIR, 'photos');
const FLOW_PATH = path.join(ROOT_DIR, '.maestro', 'screenshots.yaml');

const BUNDLE_ID = 'com.studioaryeon.pixelpaw';
const EAS_PROFILE = 'screenshots';
const DEVICE_NAME = 'Pixel Paw Screenshots';
const DEVICE_TYPE = 'iPhone 17 Pro Max';
const SUPPORTED_LANGS = ['ko', 'en']; // Must match .maestro/scripts/palette-names.js
const EXPECTED_SIZE = '1320x2868';
const JPEG_QUALITY = '92';

// Added to the photo library in this order. The iOS picker lists the newest
// photo first, so the flow picks library-4 with PHOTO_INDEX 0 and hero with 4.
const PHOTO_SLOTS = ['hero', 'library-1', 'library-2', 'library-3', 'library-4'];
const PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic'];

const STATUS_BAR_ARGS = [
  '--time', '9:41',
  '--dataNetwork', 'wifi',
  '--wifiMode', 'active',
  '--wifiBars', '3',
  '--cellularMode', 'active',
  '--cellularBars', '4',
  '--batteryState', 'discharging',
  '--batteryLevel', '100',
];

function parseArgs(argv) {
  const options = { app: null, langs: ['ko', 'en'], erase: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--app') options.app = argv[++i];
    else if (arg === '--langs') options.langs = argv[++i].split(',').map((lang) => lang.trim()).filter(Boolean);
    else if (arg === '--no-erase') options.erase = false;
    else throw new Error(`Unknown option: ${arg}`);
  }
  const unsupported = options.langs.filter((lang) => !SUPPORTED_LANGS.includes(lang));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported language: ${unsupported.join(', ')} (supported: ${SUPPORTED_LANGS.join(', ')})`);
  }
  return options;
}

function run(command, args, { capture = false, allowFailure = false, env } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: env ? { ...process.env, ...env } : process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    const details = capture ? `\n${result.stderr || result.stdout}` : '';
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}${details}`);
  }
  return result;
}

const simctl = (args, options) => run('xcrun', ['simctl', ...args], options);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (predicate(fullPath, entry)) return [fullPath];
    return entry.isDirectory() ? findFiles(fullPath, predicate) : [];
  });
}

function findAppBundle(dir) {
  const [app] = findFiles(dir, (fullPath, entry) => entry.isDirectory() && fullPath.endsWith('.app'));
  if (!app) throw new Error(`No .app bundle found in ${dir}`);
  return app;
}

function extractArchive(archivePath, destination) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  run('tar', ['-xzf', archivePath, '-C', destination]);
  return findAppBundle(destination);
}

function resolveApp(appOption) {
  if (appOption) {
    const appPath = path.resolve(appOption);
    if (appPath.endsWith('.app')) return appPath;
    return extractArchive(appPath, path.join(SCREENSHOTS_DIR, 'build', 'local'));
  }

  console.log(`Looking up the latest finished EAS "${EAS_PROFILE}" simulator build...`);
  const list = run('npx', [
    '--yes', 'eas-cli@latest', 'build:list',
    '--platform', 'ios', '--build-profile', EAS_PROFILE, '--simulator',
    '--status', 'finished', '--limit', '1', '--json', '--non-interactive',
  ], { capture: true });
  const [build] = JSON.parse(list.stdout);
  const buildUrl = build?.artifacts?.buildUrl;
  if (!buildUrl) {
    throw new Error(`No finished "${EAS_PROFILE}" build found. Run: npx eas-cli@latest build --platform ios --profile ${EAS_PROFILE}`);
  }
  console.log(`Using build ${build.id} (v${build.appVersion} (${build.appBuildVersion}))`);

  const buildDir = path.join(SCREENSHOTS_DIR, 'build', build.id);
  const archivePath = path.join(buildDir, 'app.tar.gz');
  if (!fs.existsSync(archivePath)) {
    fs.mkdirSync(buildDir, { recursive: true });
    run('curl', ['-fL', '--progress-bar', '-o', archivePath, buildUrl]);
  }
  return extractArchive(archivePath, path.join(buildDir, 'app'));
}

function findOrCreateDevice() {
  const { devices } = JSON.parse(simctl(['list', 'devices', 'available', '-j'], { capture: true }).stdout);
  for (const [runtime, runtimeDevices] of Object.entries(devices)) {
    if (!runtime.includes('iOS')) continue;
    const device = runtimeDevices.find((candidate) => candidate.name === DEVICE_NAME);
    if (device) return device.udid;
  }

  const { devicetypes } = JSON.parse(simctl(['list', 'devicetypes', '-j'], { capture: true }).stdout);
  const deviceType = devicetypes.find((type) => type.name === DEVICE_TYPE);
  const { runtimes } = JSON.parse(simctl(['list', 'runtimes', '-j'], { capture: true }).stdout);
  const runtime = runtimes
    .filter((candidate) => candidate.platform === 'iOS' && candidate.isAvailable)
    .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
  if (!deviceType || !runtime) {
    throw new Error(`Cannot create a "${DEVICE_TYPE}" simulator. Install an iOS runtime: xcodebuild -downloadPlatform iOS`);
  }
  console.log(`Creating simulator "${DEVICE_NAME}" (${DEVICE_TYPE}, ${runtime.name})`);
  return simctl(['create', DEVICE_NAME, deviceType.identifier, runtime.identifier], { capture: true }).stdout.trim();
}

function bootDevice(udid, erase) {
  if (erase) {
    simctl(['shutdown', udid], { capture: true, allowFailure: true });
    console.log('Erasing simulator for a clean photo library and app state...');
    simctl(['erase', udid]);
  }
  simctl(['boot', udid], { capture: true, allowFailure: true });
  simctl(['bootstatus', udid, '-b'], { capture: true });
  // A fresh simulator shows the "slide to type" intro over the first keyboard,
  // which hides the save dialog's buttons from Maestro.
  simctl(['spawn', udid, 'defaults', 'write', 'com.apple.keyboard.preferences',
    'DidShowContinuousPathIntroduction', '-bool', 'true']);
}

function findPhoto(slot) {
  for (const extension of PHOTO_EXTENSIONS) {
    const photoPath = path.join(PHOTOS_DIR, slot + extension);
    if (fs.existsSync(photoPath)) return photoPath;
  }
  throw new Error(`Missing photo: screenshots/photos/${slot}.jpg (slots: ${PHOTO_SLOTS.join(', ')})`);
}

async function addPhotos(udid, photos) {
  for (const photoPath of photos) {
    simctl(['addmedia', udid, photoPath]);
    // Distinct creation times keep the picker order stable.
    await sleep(1200);
  }
}

function imageSize(imagePath) {
  const output = run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', imagePath], { capture: true }).stdout;
  const width = output.match(/pixelWidth: (\d+)/)?.[1];
  const height = output.match(/pixelHeight: (\d+)/)?.[1];
  return `${width}x${height}`;
}

function captureLanguage(udid, lang) {
  const rawDir = path.join(SCREENSHOTS_DIR, 'raw', lang);
  const outputDir = path.join(SCREENSHOTS_DIR, 'appstore', lang);
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n==> Capturing "${lang}" screenshots`);
  simctl(['status_bar', udid, 'override', ...STATUS_BAR_ARGS]);
  run(findMaestro(), [
    '--device', udid, 'test', FLOW_PATH,
    '-e', `APP_LANG=${lang}`,
    '--test-output-dir', rawDir,
  ], {
    env: { MAESTRO_CLI_NO_ANALYTICS: '1', MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true' },
  });

  const screenshots = findFiles(rawDir, (fullPath) => (
    fullPath.endsWith('.png') && path.basename(path.dirname(fullPath)) === 'takeScreenshot'
  )).sort();
  const outputs = [];
  for (const screenshot of screenshots) {
    const size = imageSize(screenshot);
    const outputPath = path.join(outputDir, path.basename(screenshot, '.png') + '.jpg');
    run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', JPEG_QUALITY, screenshot, '--out', outputPath], { capture: true });
    if (size !== EXPECTED_SIZE) {
      console.warn(`  ! ${path.basename(outputPath)} is ${size}, expected ${EXPECTED_SIZE}`);
    }
    outputs.push(outputPath);
  }
  return outputs;
}

function findMaestro() {
  const bundled = path.join(os.homedir(), '.maestro', 'bin', 'maestro');
  const inPath = spawnSync('which', ['maestro'], { encoding: 'utf8' });
  if (inPath.status === 0) return inPath.stdout.trim();
  if (fs.existsSync(bundled)) return bundled;
  throw new Error('Maestro not found. Install: curl -fsSL "https://get.maestro.mobile.dev" | bash');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  findMaestro();
  const photos = options.erase ? PHOTO_SLOTS.map(findPhoto) : [];
  const appPath = resolveApp(options.app);

  const udid = findOrCreateDevice();
  console.log(`Simulator: ${DEVICE_NAME} (${udid})`);
  bootDevice(udid, options.erase);

  simctl(['install', udid, appPath]);
  simctl(['privacy', udid, 'grant', 'photos', BUNDLE_ID]);
  if (options.erase) await addPhotos(udid, photos);

  const outputs = options.langs.flatMap((lang) => captureLanguage(udid, lang));
  console.log(`\nSaved ${outputs.length} screenshots:`);
  for (const outputPath of outputs) {
    console.log(`  ${path.relative(ROOT_DIR, outputPath)}`);
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
