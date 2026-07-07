# 시그널에듀케이션 홈페이지 배포 안내

이 폴더는 정적 홈페이지 구조입니다. PHP, Node.js, 데이터베이스 없이 HTML/CSS/JS/JSON 파일만으로 구성되어 있어 일반 웹호스팅, 카페24, 가비아, 닷홈, Netlify, Vercel, GitHub Pages 등에 올리기 쉽습니다.

## 업로드할 때 핵심

도메인에 연결할 때는 압축파일 자체가 아니라, 압축을 푼 뒤 아래 파일과 폴더가 사이트 루트에 오도록 업로드하세요.

- `index.html`
- `style.css`
- `components.js`
- `main.js`
- `images/`
- `data/`
- `signal-edu/`
- `consulting/`
- `ai-connects/`
- `stories/`
- `news-contact/`
- `partnerships/`
- `admin/`

예를 들어 `https://도메인.com/`에 접속했을 때 바로 `index.html`이 열리면 정상입니다.

## 주의할 점

- `data/news.json`, `data/reviews.json`을 `fetch()`로 불러오므로, 파일을 더블클릭해서 여는 방식보다 실제 웹서버에 올려서 확인하는 것이 좋습니다.
- 관리자 페이지는 현재 서버 저장형 관리자가 아니라 브라우저 기반 확인/미리보기 성격입니다. 실제 공지 등록을 웹에서 바로 저장하려면 서버, DB, 또는 별도 CMS 연결이 필요합니다.
- 도메인 연결 자체는 쉽지만, 공지/후기 데이터를 관리자 화면에서 실제로 저장·배포하려면 추가 개발이 필요합니다.
