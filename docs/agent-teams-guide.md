# 에이전트 팀 가이드

Claude Code에서 여러 Claude 인스턴스를 병렬로 조율하는 방법.

---

## 사전 준비

### 활성화

`.claude/settings.json`에 추가 (이미 설정되어 있음):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 버전 확인

```bash
claude --version  # v2.1.32 이상 필요
```

---

## 언제 쓸까

### 에이전트 팀이 적합한 경우

- 동시에 탐색할 수 있는 **독립적인 작업**이 여러 개일 때
- 팀원들이 **서로 소통하고 결과를 공유**해야 할 때
- 연구/검토, 새 기능 개발, 버그 가설 병렬 검증, 프론트-백-테스트 동시 작업

### 에이전트 팀이 맞지 않는 경우

- 순차적으로 진행해야 하는 작업
- 같은 파일을 여러 명이 편집해야 하는 경우
- 단순한 작업 (토큰 낭비)

### Subagents와의 차이

| | Subagents | 에이전트 팀 |
|---|---|---|
| **통신** | 메인에게만 결과 보고 | 팀원끼리 직접 메시지 |
| **조율** | 메인이 모든 작업 관리 | 공유 작업 목록으로 자체 조율 |
| **토큰** | 낮음 | 높음 (팀원 수만큼 증가) |
| **적합** | 빠르고 집중된 단일 워커 | 논의·협업이 필요한 복잡한 작업 |

---

## 팀 시작하기

Claude에게 자연어로 팀 구성을 요청한다:

```
Create an agent team with 3 teammates:
- One for frontend (React components)
- One for backend (API endpoints)
- One for tests
Each should work on their area independently.
```

Claude가 알아서:
1. 팀과 공유 작업 목록 생성
2. 팀원 스폰
3. 작업 분배
4. 완료 후 정리 시도

---

## 팀 조작

### 표시 모드

| 모드 | 설명 | 요구사항 |
|---|---|---|
| `in-process` | 메인 터미널 내에서 실행, Shift+Down으로 순환 | 없음 |
| `tmux` (분할 창) | 각 팀원이 별도 창 | tmux 또는 iTerm2 |

기본값은 `auto` (tmux 세션 안이면 분할, 아니면 in-process).

`~/.claude/settings.json`에서 고정:
```json
{
  "teammateMode": "in-process"
}
```

또는 플래그로:
```bash
claude --teammate-mode in-process
```

### 팀원 탐색 (in-process)

- `Shift+Down` → 다음 팀원으로 이동 (마지막 이후엔 리더로 복귀)
- `Enter` → 선택한 팀원 세션 진입
- `Escape` → 현재 턴 중단
- `Ctrl+T` → 작업 목록 토글

### 팀원 모델 지정

```
Create a team with 4 teammates. Use Sonnet for each teammate.
```

팀원 기본 모델은 리더 모델을 상속하지 않는다. `/config`의 **기본 팀원 모델**에서 변경 가능.

### 계획 승인 요구

위험한 작업에서 팀원이 먼저 계획을 제출하게 하고 리더가 승인 후 진행:

```
Spawn a teammate to refactor the auth module.
Require plan approval before they make any changes.
```

### 작업 할당

- **리더 할당**: "A 팀원에게 X 작업 줘"
- **자체 요청**: 팀원이 현재 작업 완료 후 다음 미할당 작업 자동 선택

### 팀원 종료

```
Ask the researcher teammate to shut down
```

### 팀 정리

```
Clean up the team
```

> **주의**: 반드시 리더에서 정리. 팀원이 정리를 실행하면 리소스가 불일치 상태가 된다.

---

## 모범 사례

### 적정 팀 크기

- **3~5명**이 대부분의 작업에 적합
- 팀원당 **5~6개 작업** 유지
- 더 많다고 더 빠르지 않음 (조율 오버헤드 증가)

### 작업 크기

- 너무 작음 → 조율 오버헤드가 이익을 초과
- 너무 큼 → 체크인 없이 오래 작동, 낭비 위험
- 적당함 → 함수 단위, 테스트 파일 단위, 명확한 결과물 단위

### 팀원 생성 시 컨텍스트 상세 제공

팀원은 리더의 대화 기록을 받지 않는다. 생성 프롬프트에 필요한 정보를 모두 포함:

```
Spawn a security reviewer teammate with the prompt:
"Review src/auth/ for security vulnerabilities.
Focus on token handling, session management, input validation.
The app uses JWT tokens stored in httpOnly cookies.
Report issues with severity ratings."
```

### 파일 충돌 방지

두 팀원이 같은 파일 편집 → 덮어쓰기 발생. 팀원별 파일 영역을 분리.

### 팀원 대기 지시

리더가 팀원을 기다리지 않고 직접 작업을 시작할 때:

```
Wait for your teammates to complete their tasks before proceeding
```

---

## 사용 사례 예시

### PR 병렬 코드 리뷰

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

### 버그 가설 병렬 검증

```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses.
Have them talk to each other to try to disprove each other's theories,
like a scientific debate. Update the findings doc with whatever consensus emerges.
```

### 새 기능 병렬 개발

```
Create a team with 4 teammates to implement the user profile feature:
- One for the API routes (src/api/profile/)
- One for the database models (src/models/)
- One for the frontend components (src/components/profile/)
- One for tests (src/__tests__/profile/)
```

---

## Subagent 정의 재사용

`.claude/agents/` 또는 프로젝트에 정의된 subagent 타입을 팀원으로 사용 가능:

```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

팀원은 해당 정의의 `tools` 허용 목록과 `model`을 따른다.  
단, `skills`와 `mcpServers` frontmatter는 팀원으로 실행 시 적용되지 않음.

---

## Hooks로 품질 게이트

| Hook | 트리거 | 용도 |
|---|---|---|
| `TeammateIdle` | 팀원이 유휴 상태가 될 때 | exit 2로 피드백 보내고 계속 작동 |
| `TaskCreated` | 작업 생성 시 | exit 2로 생성 방지 |
| `TaskCompleted` | 작업 완료 표시 시 | exit 2로 완료 방지 |

---

## 파일 저장 위치

| 항목 | 경로 |
|---|---|
| 팀 구성 | `~/.claude/teams/{team-name}/config.json` |
| 작업 목록 | `~/.claude/tasks/{team-name}/` |

> 이 파일들은 자동 생성·관리됨. 수동 편집 금지 (다음 상태 업데이트에서 덮어씌워짐).

---

## 문제 해결

| 증상 | 해결 |
|---|---|
| 팀원이 안 보임 | Shift+Down으로 순환 확인, `which tmux` 확인 |
| 권한 프롬프트 많음 | 팀원 생성 전에 permissions에서 사전 승인 |
| 팀원이 오류 후 멈춤 | Shift+Down으로 직접 접속해 추가 지시, 또는 대체 팀원 생성 |
| 리더가 일찍 종료 | "모든 팀원이 완료될 때까지 기다려" 지시 |
| tmux 세션 잔류 | `tmux ls` → `tmux kill-session -t <name>` |

---

## 알려진 제한 사항

- in-process 팀원은 `/resume`, `/rewind`로 복원 불가
- 세션당 팀 하나만 관리 가능
- 팀원이 팀을 만들 수 없음 (중첩 팀 불가)
- 리더십 이전 불가
- 분할 창 모드는 VS Code 터미널, Windows Terminal, Ghostty 미지원
