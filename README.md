# @pckdou/week9-demo

GitHub Packages(npm, Docker)와 의존성 보안 자동화(Dependabot, npm audit, Snyk) 실습 프로젝트입니다.

## 사용법

### npm 패키지 설치

`.npmrc`에 GitHub Packages 레지스트리와 `read:packages` 토큰을 설정합니다.

```
@pckdou:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<YOUR_TOKEN>
```

```bash
npm install @pckdou/week9-demo@1.0.1
```

```js
const { hello, bye } = require("@pckdou/week9-demo");
console.log(hello("GHP")); // Hello, GHP!
console.log(bye("GHP"));   // Bye, GHP!
```

### Docker 이미지 실행

```bash
docker pull ghcr.io/pckdou/week9-demo:1.0.1
docker run -d --name w9 -p 3000:3000 ghcr.io/pckdou/week9-demo:1.0.1
curl http://localhost:3000   # Hello, Docker!
```

## 1. 패키지 배포

| 항목 | 내용 |
|---|---|
| npm | GitHub Packages에 `1.0.0` → `1.0.1` 배포 (`bye` 함수 추가) |
| Docker | GHCR에 `1.0.0`, `1.0.1`, `latest`, `main`, `sha-*` 태그로 푸시 |
| 트리거 | npm: Release 발행 시 / Docker: `main` push 및 `v*.*.*` 태그 push |

- 패키지 링크: https://github.com/pckdou/week9-demo/pkgs/npm/week9-demo
- 이미지 링크: https://github.com/pckdou/week9-demo/pkgs/container/week9-demo

### 버전 업데이트 절차

```bash
npm version patch -m "chore: release %s"   # 1.0.0 -> 1.0.1, 태그 자동 생성
git push origin main --follow-tags
# GitHub에서 v1.0.1 Release 발행 -> Publish npm package 워크플로 실행
```

## 2. Dependabot 정책 (`.github/dependabot.yml`)

| 항목 | 설정 | 이유 |
|---|---|---|
| 스케줄 | npm/docker 매주 월요일 09:00(KST), github-actions 매월 | PR이 한꺼번에 몰리지 않도록 주기 분리 |
| 그룹 | npm의 dev / prod 의존성 중 minor·patch를 각각 1개 PR로 묶음 | PR 수와 리뷰 부담 감소 |
| ignore | semver-major 업데이트 제외 | 호환성이 깨질 수 있어 수동 검토 |
| PR 제한 | 동시에 최대 5개 | 관리 가능한 수준 유지 |

### 자동 머지 조건 (`dependabot-automerge.yml`)

1. PR 작성자가 `dependabot[bot]`
2. 업데이트 유형이 **patch 또는 minor** (major 제외)
3. 필수 상태 체크 `test`(CI) 통과 (브랜치 Ruleset으로 강제)
4. 조건을 만족하면 `gh pr merge --auto --squash`로 자동 머지 예약

major 업데이트는 자동 머지하지 않고 사람이 검토합니다.

## 3. 보안 스캔 자동화 (`security-scan.yml`)

| 도구 | 동작 | 결과 확인 |
|---|---|---|
| npm audit | push / PR / 매주 월요일 실행. High 이상이면 `security-audit` 라벨 이슈 자동 생성(기존 이슈가 있으면 댓글 추가) | Issues, Actions Artifacts(`npm-audit-report`) |
| Snyk | 의존성 취약점