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

## Cleanup

아티팩트 정리:

```bash
npm run clean:artifacts
```

삭제 전 미리 보기:

```bash
npm run clean:artifacts -- --dry-run
```
