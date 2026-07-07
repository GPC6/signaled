# 시그널에듀 홈페이지 코드 정리 요약

## 이번 정리의 원칙

- 기존 기능과 화면 구조는 유지했습니다.
- 한 파일에 몰려 있던 스타일을 역할별 파일로 분리했습니다.
- 페이지 안에 직접 들어가 있던 스타일과 스크립트를 별도 파일로 옮겼습니다.
- 공통 헤더/푸터는 `components.js`에서 계속 한 번에 관리합니다.

## 정리된 구조

```text
style.css                         # CSS import 전용 진입 파일
assets/css/01-foundation-header.css
assets/css/02-home-sections.css
assets/css/03-subpage-signal.css
assets/css/04-navigation-overrides.css
assets/css/05-page-sections.css
assets/css/06-news-detail.css
components.js                     # 공통 헤더/푸터
main.js                           # 공통 인터랙션
news-contact/news-detail.js        # 공지 상세 페이지 전용 스크립트
admin/admin.css                    # 관리자 페이지 전용 스타일
admin/admin.js                     # 관리자 페이지 전용 스크립트
```

## 앞으로 수정할 때 기준

- 메뉴, 로고, 푸터 문구 수정: `components.js`
- 전체 색상, 기본 레이아웃, 헤더 수정: `assets/css/01-foundation-header.css`
- 메인 화면 수정: `assets/css/02-home-sections.css`
- 시그널에듀 소개 페이지 수정: `assets/css/03-subpage-signal.css`
- 상단 메뉴/메가메뉴 수정: `assets/css/04-navigation-overrides.css`
- 하위 페이지 공통 섹션 수정: `assets/css/05-page-sections.css`
- 공지 상세 페이지 수정: `assets/css/06-news-detail.css`, `news-contact/news-detail.js`
- 관리자 페이지 수정: `admin/admin.css`, `admin/admin.js`

## 확인한 사항

- `components.js`, `main.js`, `admin/admin.js`, `news-contact/news-detail.js` 문법 검사 통과
- 모든 HTML의 로컬 CSS/JS 참조 경로 확인 완료
- HTML 내부 `<style>` 태그 제거
- 반복되던 일회성 inline style 대부분 제거
