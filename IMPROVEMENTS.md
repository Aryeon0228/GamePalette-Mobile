# Pixel Paw - 개선 사항 리스트

## 1. 즉시 수정 필요 (버그/안정성)

- [ ] **Toast 타이머 미정리** - `HomeScreen.tsx` 컴포넌트 언마운트 시 `toastTimeoutRef`가 정리되지 않아 메모리 누수 발생 가능
- [ ] **Array.fill 참조 공유 버그** - `colorExtractor.ts:292, 421` `Array(k).fill({ r:128, g:128, b:128 })`은 같은 객체 참조를 공유하여 하나 수정 시 전부 변경됨. `Array.from()`으로 수정 필요
- [ ] **Race Condition** - 이미지 연속 선택 시 이전 추출이 완료되기 전에 새 추출 시작되면 이전 결과가 새 이미지에 적용될 수 있음. `AbortController` 필요
- [ ] **selectedColorIndex 범위 초과** - 색상 수가 줄어들면 선택된 인덱스가 유효 범위를 벗어날 수 있음

---

## 2. 성능 개선

- [ ] **HomeScreen God Component 분리** (1132줄, state 18개) - 커스텀 훅으로 분리 필요
  - `useImagePicker()` - 카메라/갤러리
  - `useColorExtraction()` - 추출 로직
  - `useExportHandlers()` - 내보내기
  - `useModalManager()` - 모달 상태 통합 관리
- [ ] **콜백 함수 미메모이제이션** - 자식 컴포넌트에 전달하는 인라인 함수들이 매 렌더마다 재생성. `useCallback` 적용 필요
- [ ] **FlatList 최적화 누락** - `LibraryScreen.tsx`에 `initialNumToRender`, `maxToRenderPerBatch`, `removeClippedSubviews` 미설정

---

## 3. 코드 품질

- [ ] **함수 중복 제거**
  - `rgbToHsl` - `colorExtractor.ts` + `colorUtils.ts` 양쪽에 33줄 중복
  - `rgbToHex` - `colorExtractor.ts` + `colorUtils.ts` 동일 로직
  - Luminosity 공식 - 3곳에 하드코딩, 상수로 추출 필요
  - Export 로직 - `HomeScreen` + `LibraryScreen` 중복, 공통 유틸로 분리 필요
- [ ] **모달 UI 불일치 통일** - 핸들바, 햅틱 피드백 횟수, 닫기 버튼 스타일이 모달마다 다름. 공통 `<ModalWrapper>` 컴포넌트로 통일
- [ ] **매직 넘버 상수화** - `MAX_CACHE_SIZE = 512`, `paddingTop: 56` 등 하드코딩된 값들을 상수로 추출
- [ ] **Peak detection 불일치** - `colorExtractor.ts:613-620` smoothed 값으로 임계치 비교하면서 original 값을 합산하는 문제

---

## 4. 에러 처리 보강

- [ ] **Clipboard 실패 처리 없음** - 실패해도 성공 토스트 표시
- [ ] **UPNG 디코딩 실패** - 빈 배열 반환, 사용자에게 알림 없음
- [ ] **단색 이미지 처리** - 요청한 색상 수보다 적게 반환될 수 있음
- [ ] **투명 이미지** - 최소 픽셀 수 검증 없음
- [ ] **Error Boundary 없음** - 자식 컴포넌트 크래시 시 앱 전체 다운

---

## 5. 엣지 케이스

- [ ] **단색 이미지** - 요청 5색인데 1색만 반환
- [ ] **전부 투명 이미지** - 픽셀 5개로 K-means(k=8) 실행
- [ ] **selectedColorIndex 동기화** - 색상 수 변경 시 인덱스 유효성 미검증

---

## 6. 프로덕션 필수 (미구현)

- [ ] **테스트 코드** - Jest/RTL 설정 전무
- [ ] **ESLint/Prettier** - 코드 스타일 일관성 도구 없음
- [ ] **접근성 (a11y)** - `accessibilityLabel` 전혀 없음
- [ ] **에러 로깅** - `console.error`만 사용, Sentry 등 미적용
- [ ] **버전 불일치** - `app.json` v1.1.0 vs `package.json` v1.0.0 동기화 필요

---

## 7. 상태 관리

- [ ] **themeStore 불필요** - 읽기 전용이며 변경 불가. 상수 파일로 대체하거나 테마 전환 기능 구현
- [ ] **paletteStore selector 부재** - `getPaletteById`, `getRecentPalettes`, `getTotalCount` 등 파생 상태 없음
- [ ] **Prop Drilling** - HomeScreen에서 자식 컴포넌트로 20개 이상 props 전달. Context 또는 store로 개선

---

## 우선순위 요약

| 순위 | 작업 | 난이도 | 영향도 |
|:---:|------|:---:|:---:|
| 1 | Toast 타이머 cleanup 추가 | 낮음 | 높음 |
| 2 | Array.fill 버그 수정 | 낮음 | 높음 |
| 3 | Race condition 방지 | 중간 | 높음 |
| 4 | HomeScreen 커스텀 훅 분리 | 높음 | 높음 |
| 5 | 모달 공통 래퍼 컴포넌트 | 중간 | 중간 |
| 6 | 중복 함수 통합 | 낮음 | 중간 |
| 7 | 접근성 라벨 추가 | 중간 | 중간 |
| 8 | 테스트 인프라 구축 | 높음 | 높음 |
