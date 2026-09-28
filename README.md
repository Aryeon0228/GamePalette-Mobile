# GamePalette-Mobile

## Development Environment

- Node.js: `20` (see `./.nvmrc`)
- 권장 명령:

```bash
nvm install
nvm use
```

## Release Workflow

### 1) 시뮬레이터 QA

```bash
cd "/Users/heo1408/GamePalette-Mobile"
npx expo start --ios
```

### 2) iOS build number 올리기

기본은 `+1` 자동 증가:

```bash
npm run bump:ios-build
```

특정 번호로 직접 지정:

```bash
npm run bump:ios-build -- --to 21
```

### 3) 릴리즈 사전 검증

아래 명령 1개로 전체 검증:

```bash
npm run check:release
```

`check:release` 포함 항목:
- ko/en 로컬라이징 키 누락 체크
- unit test
- TypeScript 타입 체크
- expo-doctor
- iOS version/build 동기화 체크

### 4) GitHub flow

```bash
git checkout -b codex/<work-name>
git add .
git commit -m "chore: <summary>"
git push -u origin codex/<work-name>
gh pr create --base main --head codex/<work-name>
gh pr merge --squash --delete-branch
```

### 5) TestFlight 빌드/제출

```bash
npx eas build --platform ios --profile production --non-interactive
npx eas submit --platform ios --profile production --latest --non-interactive
```

## App Store 스크린샷

EAS 시뮬레이터 빌드(Release)를 iPhone 17 Pro Max 시뮬레이터에 설치하고 Maestro로 한국어·영어 화면을 찍어
`screenshots/appstore/<lang>/*.jpg`(1320×2868)로 저장합니다.

필요한 것: Xcode + iOS 시뮬레이터 런타임(`xcodebuild -downloadPlatform iOS`), Java 17+, Maestro, EAS 로그인

```bash
# 1) 시뮬레이터 빌드 — 화면이나 testID가 바뀌었을 때만 다시
npx eas-cli@latest build --platform ios --profile screenshots

# 2) 사진 준비 (시뮬레이터엔 카메라가 없어 갤러리로 넣음)
#    screenshots/photos/hero.jpg, library-1.jpg ... library-4.jpg

# 3) 캡처 — 최신 screenshots 빌드를 받아 설치 후 ko, en 순서로 촬영
npm run screenshots
npm run screenshots -- --langs en
npm run screenshots -- --app path/to/PixelPaw.app
```

- 시뮬레이터 `Pixel Paw Screenshots`는 매번 초기화되고 상태 표시줄은 9:41로 고정됩니다. (`--no-erase`로 초기화 생략)
- 한 번에 약 20분(언어당 9분) 걸립니다. 도중에 Mac 덮개를 닫아 잠자기에 들어가면 `Timed out while requesting screenshot`으로 실패하니, 실패한 언어만 `--langs`로 다시 찍으세요.
- 찍는 화면과 순서는 `.maestro/screenshots.yaml`, 보관함 팔레트 이름은 `.maestro/scripts/palette-names.js`에서 바꿉니다.

## Cleanup

아티팩트 정리:

```bash
npm run clean:artifacts
```

삭제 전 미리 보기:

```bash
npm run clean:artifacts -- --dry-run
```
