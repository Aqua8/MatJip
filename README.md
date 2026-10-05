# MatJip

카카오 지도 기반으로 맛집을 검색·즐겨찾기하고, 별점과 사진이 담긴 리뷰를 작성·공유하는 서비스입니다. 흑백 타이포그래피 중심의 미니멀 디자인을 따릅니다.

> **상태**: 개발 완료. 배포해서 몇 개월간 운영했고, 비용 문제로 운영을 중단했습니다.
> 설계와 진행 기록은 [`plan.md`](./plan.md), 검증 결과는 [`docs/qa-report.md`](./docs/qa-report.md)에 있습니다.

## 주요 기능

- **지도 검색**: 카카오맵 위에 맛집 마커를 표시합니다. 일반·즐겨찾기·선택 상태를 마커로 구분하고, 지도의 기본 장소를 눌러도 식당 정보 패널이 열립니다.
- **목록 사이드바**: 키워드 검색, 카테고리 필터, 최근 본 식당 순 정렬(브라우저 저장)
- **맛집 상세**: 기본 정보, 평균 별점, 좋아요, 즐겨찾기, 리뷰 목록
- **리뷰**: 별점·글·사진 작성, 수정, 삭제. 사진은 Google Cloud Storage에 업로드합니다.
- **즐겨찾기**: 저장한 맛집 모아 보기. 즐겨찾기를 누를 때만 서버에 식당을 등록해 불필요한 데이터를 만들지 않습니다.
- **계정**: 회원가입·로그인(JWT), 닉네임 변경, 비밀번호 변경(영문+숫자+특수문자 8자 이상, 프론트·백엔드 이중 검증), 내가 쓴 리뷰
- **반응형**: 모바일에서는 오버레이 사이드바와 하단 시트로 동작합니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 19.2, Vite 8, Tailwind CSS 4.3, React Router 7.17, Axios 1.18 (Node.js 22 기준 빌드, 로컬 개발 Node 24) |
| Backend | Java 21, Spring Boot 4.0.7, Spring Data JPA, Spring Security, JJWT 0.12.6, Gradle 8.14 |
| Database | MariaDB (JDBC 드라이버 mariadb-java-client) |
| 외부 서비스 | 카카오맵 API, Google Cloud Storage (google-cloud-storage 2.43.2) |
| 배포 | Docker (eclipse-temurin 21, node 22-alpine, nginx), Vercel 설정 포함 |

## 구조

```
MatJip/
├── backend/    # Spring Boot API (포트 8080)
├── frontend/   # React 앱
├── docs/       # 카카오맵 API 정리, QA 보고서, 에이전트 팀 가이드
└── plan.md     # 설계 문서와 진행 현황
```

## 화면

| 경로 | 화면 |
|---|---|
| `/` | 지도 + 목록 사이드바 + 상세 패널 |
| `/restaurants/:id` | 맛집 상세 |
| `/bookmarks` | 즐겨찾기 |
| `/mypage` | 로그인·회원가입, 프로필, 내 리뷰 |

## 로컬 실행

### Backend
1. `backend/src/main/resources/application-example.yml`을 참고해 `application.yml`을 만듭니다. (DB 연결 정보, JWT 시크릿(32자 이상), GCS 버킷 이름)
2. `backend`에서 `./gradlew bootRun`

`application.yml`에는 접속 정보가 들어가므로 저장소에 올리지 않습니다. (`.gitignore` 처리됨)

### Frontend
1. `frontend/.env.example`을 복사해 `.env.development`를 만들고 값을 채웁니다.
   - `VITE_KAKAO_APP_KEY` : 카카오 JavaScript 키 (사용할 도메인을 카카오 개발자 콘솔에 등록해야 합니다)
   - `VITE_API_BASE_URL` : 백엔드 주소
2. `frontend`에서 `npm install` 후 `npm run dev`

## 개발 방식

기능 단위로 브랜치를 만들어 개발하고 PR로 병합했습니다. DB 접속 정보와 키는 저장소에 올리지 않습니다.
카카오맵 SDK 사용법은 [`docs/kakao-map-api.md`](./docs/kakao-map-api.md)에 정리해 두었습니다.
