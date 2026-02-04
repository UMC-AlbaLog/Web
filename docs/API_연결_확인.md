# 로컬에서 API 연결·데이터 확인 방법

## 1단계: baseURL 설정

1. `.env`에서 `VITE_API_BASE_URL`을 실제 백엔드 주소로 수정  
   예: `VITE_API_BASE_URL=https://api.example.com`
2. **수정 후 반드시 개발 서버 재시작** (Vite는 빌드 시점에 env를 읽음)
   ```bash
   # 터미널에서 Ctrl+C로 서버 종료 후
   pnpm run dev
   ```
3. 브라우저에서 터미널에 나온 주소(예: `http://localhost:5173`)로 접속

---

## 2단계: Authorization: Bearer & accessToken

- 모든 인증 필요한 API 요청에는 **`Authorization: Bearer <accessToken>`** 헤더가 붙습니다 (`src/api/client.ts`).
- `accessToken`은 **Session Storage**에 키 `accessToken`으로 저장됩니다.

### 자동 저장 (권장)

- **Google 로그인 성공** 시, 앱이 백엔드에 Google ID 토큰을 보내고 JWT를 받아 `accessToken`으로 저장합니다.
- 백엔드에서 **POST `/auth/google`** (또는 `src/api/auth.ts`에서 설정한 경로) 로:
  - **Request body**: `{ idToken: "구글_ID_토큰" }`
  - **Response**: **반드시 JSON** `{ "accessToken": "JWT_문자열" }`  
  을 주면, 로그인 후 자동으로 Session Storage에 `accessToken`이 저장됩니다.
- **`accessToken`이 Session Storage에 있어야** 스케줄 일정 추가/수정/삭제, 오늘 근무 조회, 수입 API 등이 백엔드와 연동됩니다. 토큰이 없으면 해당 API는 호출하지 않고 **로컬(스케줄·수입 등)만** 사용합니다.
- 백엔드 경로/body가 다르면 `src/api/auth.ts`의 `loginWithGoogle`에서 path·body만 수정하면 됩니다.

### 수동 설정 (테스트용)

1. **F12** → **Application** → **Session Storage**
2. **키**: `accessToken`  
   **값**: 백엔드에서 받은 JWT 문자열

---

## 3단계: 연결 여부 확인 (콘솔)

1. **F12** → **Console** 탭 열어 둔 상태에서
2. **수입** 메뉴로 이동 (토큰이 있어야 요청이 나감)
3. 콘솔에서 다음 로그 확인:

| 로그 | 의미 |
|------|------|
| `[API] 요청: GET https://...` | 요청이 나간 URL (baseURL이 맞는지 확인) |
| `[API] 응답: 200 /api/... → items N건 {...}` | **연결 성공** + 서버에서 내려준 데이터 |

- **200 / 201** → 연결 성공
- **401** → 토큰 없음/만료 (Session Storage에 `accessToken` 확인)
- **404** → 경로 오류 (백엔드 라우트와 URL 확인)
- **500** → 서버 오류 (백엔드 로그 확인)
- **CORS 에러** → 백엔드에서 `http://localhost:5173` 출처 허용 필요

---

## 4단계: 데이터 잘 불러오는지 확인

### 콘솔로 보기 (개발 모드)

- **수입** 페이지 이동 후 Console에 찍힌 **`[API] 응답: 200 ... → ...`** 줄을 펼치면
  - **정산 목록**: `items` 배열 개수, 각 항목(날짜, 매장명, 금액 등)
  - **대시보드**: `month`, `actualIncome`, `expectedIncome`, `brandIncomes` 등  
  을 그대로 볼 수 있습니다.
- 여기서 배열이 비어 있지 않고, 필드 값이 예상대로면 **데이터까지 잘 불러온 것**입니다.

### Network 탭으로 보기

1. **F12** → **Network** 탭 → **Fetch/XHR** 필터
2. **수입** 페이지로 이동(또는 새로고침)
3. 목록에서 `settlement-status-list` 또는 `dashboard` 요청 클릭
4. **Response** 탭에서 서버가 준 JSON 전체 확인  
   - `items: [...]` / `success: { ... }` 등이 있으면 데이터 정상 수신

### 화면으로 보기

- **수입** 페이지에서  
  - 실제 수입 금액, 예상 수입, 목표 달성률, 근무 내역 테이블  
  이 **로컬 더미가 아니라 서버 값으로 채워지면** API 데이터가 잘 쓰이고 있는 겁니다.  
  (토큰 없으면 로컬 데이터만 보이므로, 반드시 2단계 토큰 설정 후 확인)

---

## 5단계: 스케줄 API 확인

- **스케줄** 메뉴에서 **일정 추가 / 수정 / 삭제**를 한 번 수행
- Console에  
  `[API] 요청: POST ...` 또는 `PATCH` / `DELETE`  
  `[API] 응답: 201 ...` 또는 `200`  
  이 보이고, 화면에 반영되면 스케줄 API도 연결·데이터 반영이 된 것입니다.

---

## 요약 체크리스트

| 확인 항목 | 방법 |
|-----------|------|
| baseURL 적용됐는지 | Console `[API] 요청` 로그에 찍힌 URL이 `.env`의 주소인지 확인 |
| API 연결됐는지 | `[API] 응답: 200` 또는 Network 탭에서 Status 200/201 확인 |
| 데이터 잘 불러오는지 | `[API] 응답` 로그 펼쳐서 `items`/`success` 내용 확인, 또는 수입 화면에 금액·목록 표시 확인 |
| 토큰 문제인지 | 401 나오면 Session Storage에 `accessToken` 넣고 다시 수입 페이지 이동 |

---

## 홈 / 오늘 근무가 안 보일 때

- **오늘의 근무 리스트**는 `GET /api/work-logs/today`로 불러옵니다.
- **토큰이 없으면** 이 API를 호출하지 않고, 로컬 스케줄만 보여줍니다. (로컬에 오늘 일정이 없으면 빈 화면)
- **확인 순서**
  1. **F12 → Application → Session Storage** 에 `accessToken` 키가 있는지 확인
  2. 없으면: **Google 로그인**을 하거나, 테스트용이라면 **GET /api/test**로 토큰 발급 후 Session Storage에 `accessToken`으로 저장
  3. **F12 → Console** 에 `[API] 요청: GET ... work-logs/today` 가 나오는지 확인
  4. **401** 이 나오면 토큰 만료 → `GET /api/user/auth/refresh` 로 새 토큰 받아서 다시 저장

홈에서 **근무 추가**가 서버에 안 올라가면: 같은 이유로 토큰이 없거나, `POST /api/schedules` 가 401/404/500 을 주는지 **Network** 탭에서 해당 요청을 눌러 **Status** 와 **Response** 를 확인하세요.

---

## 자주 나오는 상황

| 현상 | 확인할 것 |
|------|------------|
| `[API] 요청` 로그가 안 보임 | 토큰 없으면 수입/홈 API는 호출 안 함. Session Storage에 `accessToken` 설정 후 해당 페이지 다시 이동 |
| 401 Unauthorized | `accessToken` 없음/만료. 백엔드에서 새 토큰 발급 후 Session Storage에 다시 저장 |
| CORS 에러 | 백엔드에서 프론트 출처(예: `http://localhost:5173`) 허용 필요 |
| 404 Not Found | `VITE_API_BASE_URL` + 경로가 서버 라우트와 일치하는지 확인 |
