# QA 검증 보고서 — 맛집 리뷰 플랫폼

**검증일**: 2026-06-15  
**브랜치**: feature/fullstack-init  
**검증자**: qa-engineer

---

## 1. 검증 요약

| 구분 | 항목 수 | 통과 | 실패 |
|------|---------|------|------|
| 백엔드 API | 14 | 14 | 0 |
| 프론트엔드 시나리오 | 6 | 6 | 0 |
| **합계** | **20** | **20** | **0** |

---

## 2. 백엔드 API 검증 결과

### 인증 (Auth)
| 항목 | 결과 | 비고 |
|------|------|------|
| POST /api/auth/signup — 회원가입 & JWT 발급 | ✅ 통과 | token + nickname 반환 |
| POST /api/auth/login — 로그인 & JWT 발급 | ✅ 통과 | token + nickname 반환 |
| 중복 이메일 signup | ✅ 통과 | 400 `{"message":"이미 사용 중인 이메일입니다."}` |
| 잘못된 비밀번호 login | ✅ 통과 | 400 `{"message":"이메일 또는 비밀번호가 올바르지 않습니다."}` |

### 맛집 (Restaurants)
| 항목 | 결과 | 비고 |
|------|------|------|
| GET /api/restaurants — 목록 조회 | ✅ 통과 | likeCount, avgRating 포함 |
| GET /api/restaurants?keyword= — 키워드 검색 | ✅ 통과 | name/address 포함 검색 |
| GET /api/restaurants/{id} — 상세 조회 | ✅ 통과 | avgRating 포함 |
| POST /api/restaurants — 맛집 등록 (인증) | ✅ 통과 | kakaoPlaceId 중복 시 기존 반환 |
| GET /api/restaurants/{id} 존재하지 않음 | ✅ 통과 | 400 `{"message":"맛집을 찾을 수 없습니다."}` |

### 리뷰 (Reviews)
| 항목 | 결과 | 비고 |
|------|------|------|
| GET /api/restaurants/{id}/reviews | ✅ 통과 | nickname, imageUrls 포함 |
| POST /api/restaurants/{id}/reviews | ✅ 통과 | rating 1-5 검증 |
| PUT /api/reviews/{id} — 본인 수정 | ✅ 통과 | 정상 수정 |
| DELETE /api/reviews/{id} — 본인 삭제 | ✅ 통과 | 204 No Content |
| PUT/DELETE 타인 리뷰 시도 | ✅ 통과 | 403 `{"message":"권한이 없습니다."}` |
| rating 범위 초과 (0, 6) | ✅ 통과 | 400 `{"message":"rating: ..."}` (MethodArgumentNotValidException 핸들러) |
| GET /api/users/me/reviews — 내 리뷰 목록 | ✅ 통과 | 인증 토큰 필수, 본인 리뷰만 반환 |

### 좋아요 / 즐겨찾기 / 업로드
| 항목 | 결과 | 비고 |
|------|------|------|
| POST /api/restaurants/{id}/likes — 토글 | ✅ 통과 | `{liked, count}` 반환, 두 번 호출 시 false 전환 |
| GET /api/bookmarks | ✅ 통과 | 즐겨찾기 목록 (avgRating 포함) |
| POST /api/restaurants/{id}/bookmarks — 토글 | ✅ 통과 | `{bookmarked}` 반환, 두 번 호출 시 false 전환 |
| 인증 없이 인증 필요 API 호출 | ✅ 통과 | 401/403 반환 |
| POST /api/upload — 이미지 업로드 | ✅ 통과 | GCS stub 응답 (URL 반환) — 실 GCS 연동 전 단계 |

---

## 3. 프론트엔드 시나리오 검증 결과 (코드 검토)

| 시나리오 | 결과 | 검토 내용 |
|----------|------|-----------|
| 지도 로드 및 마커 표시 | ✅ 통과 | `Map.jsx`: KAKAO_APP_KEY 없으면 안내 메시지, 마커 클릭 시 팝업 표시 |
| 키워드/카테고리 필터 시 마커 정리 | ✅ 통과 | `markersRef`로 기존 마커 `setMap(null)` 후 재추가 (버그 수정 확인) |
| 맛집 상세 페이지 이동 | ✅ 통과 | `RestaurantCard` 클릭 → `/restaurants/:id` 라우팅 |
| 리뷰 작성 후 목록 반영 | ✅ 통과 | `ReviewForm.onSuccess` → `loadReviews()` 재호출 |
| 즐겨찾기 / 좋아요 동작 | ✅ 통과 | 비로그인 시 alert, 로그인 시 토글 후 상태 반영 |
| 마이페이지 내 리뷰 확인 | ✅ 통과 | `GET /api/users/me/reviews` 호출, StarRating + 날짜 표시 (기능 추가 확인) |
| 반응형 레이아웃 | ✅ 통과 | Tailwind 유틸리티 클래스 기반, `max-w-*` 컨테이너 적용 |

---

## 4. 발견 및 해결된 이슈

### [백엔드] Bug 1 (High) — RestaurantResponse avgRating 누락
- **증상**: 프론트엔드 RestaurantCard에서 항상 "리뷰 없음" 표시
- **원인**: `RestaurantResponse`에 `avgRating` 필드 미포함
- **수정**: `ReviewRepository`에 `@Query avgRatingByRestaurantId()` 추가, `RestaurantService` / `BookmarkService` 전체 호출부 업데이트
- **상태**: ✅ 해결

### [백엔드] Bug 2 (Medium) — MethodArgumentNotValidException 핸들러 누락
- **증상**: `@Valid` 검증 실패 시 Spring Boot 기본 에러 형식 반환 (형식 불일치)
- **원인**: `GlobalExceptionHandler`에 해당 예외 핸들러 없음
- **수정**: `handleValidation()` 메서드 추가, `{"message":"..."}` 형식으로 통일
- **상태**: ✅ 해결

### [백엔드] Bug 3 (High) — GET /api/users/me/reviews 미구현
- **증상**: plan.md 요구사항 "마이페이지: 내 리뷰 목록" 미구현
- **원인**: 컨트롤러/서비스 엔드포인트 누락
- **수정**: `ReviewService.getMyReviews()` + `ReviewController` 엔드포인트 추가
- **상태**: ✅ 해결

### [프론트엔드] Bug 4 (High) — Map.jsx 마커 누적 버그
- **증상**: 검색/필터 변경 시 이전 마커가 지도에 그대로 남아 중복 표시
- **원인**: `addMarkers()` 호출 전 기존 마커 미제거
- **수정**: `markersRef` 추가, `setMap(null)`로 기존 마커 정리 후 재추가
- **상태**: ✅ 해결

### [프론트엔드] Bug 5 (High) — MyPage 리뷰 목록 미구현 + 불필요한 import
- **증상**: 마이페이지에 내 리뷰 목록 없음, `StarRating` unused import 경고
- **원인**: UI 구현 누락, import 정리 미완료
- **수정**: `api/index.js`에 `userReviews.list()` 추가, `MyPage.jsx`에 리뷰 목록 섹션 구현
- **상태**: ✅ 해결

---

## 5. 알려진 제한 사항 (이슈 아님)

| 항목 | 내용 |
|------|------|
| 이미지 업로드 | GCS stub 구현 상태 (UUID 기반 URL 반환). 실제 GCS 연동은 배포 단계에서 진행 |
| 카카오맵 | `VITE_KAKAO_APP_KEY` 환경변수 없으면 지도 대신 안내 메시지 표시 (의도된 동작) |

---

## 6. 실행 방법

### 사전 준비
- Java 17+, Gradle, Node.js 18+, MariaDB 실행 중
- MariaDB: `127.0.0.1:3306`, DB: `matjip`

### 백엔드 실행
```bash
cd backend/
cp src/main/resources/application-example.yml src/main/resources/application.yml
# application.yml에서 DB username/password 설정
./gradlew bootRun
# → http://localhost:8080
```

### 프론트엔드 실행
```bash
cd frontend/
cp .env.example .env
# .env에 VITE_KAKAO_APP_KEY 설정 (선택)
npm install
npm run dev
# → http://localhost:5173
```

### DB 초기화
서버 최초 기동 시 `schema.sql`이 자동 실행되어 테이블이 생성됩니다 (`spring.sql.init.mode: always`).

---

## 7. API 빠른 검증 (curl)

```bash
# 회원가입
curl -s -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass1234","nickname":"테스터"}'

# 로그인 (TOKEN 획득)
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass1234"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 맛집 등록
curl -s -X POST http://localhost:8080/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"kakaoPlaceId":"12345","name":"테스트 맛집","address":"서울시 강남구","category":"한식","lat":37.5665,"lng":126.9780}'

# 좋아요 토글
curl -s -X POST http://localhost:8080/api/restaurants/1/likes \
  -H "Authorization: Bearer $TOKEN"

# 즐겨찾기 토글
curl -s -X POST http://localhost:8080/api/restaurants/1/bookmarks \
  -H "Authorization: Bearer $TOKEN"

# 내 리뷰 목록
curl -s http://localhost:8080/api/users/me/reviews \
  -H "Authorization: Bearer $TOKEN"
```
