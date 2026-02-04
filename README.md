# 진주떡집 (Jinjood) - Next.js

부산 수영구 남천동에 위치한 전통 떡집 웹사이트

- **Production**: https://jinjood.com
- **Staging**: https://jinjood-nextjs.vercel.app (배포 후 생성)

---

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Styled Components + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (이메일 + 카카오)
- **State**: Zustand
- **Animation**: Framer Motion

---

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

---

## Vercel 배포

### 1. GitHub에 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/jinjood-nextjs.git
git push -u origin main
```

### 2. Vercel 배포
1. [vercel.com](https://vercel.com) 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 import
4. **Environment Variables 설정** (필수!)
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
5. "Deploy" 클릭

### 3. 배포 후 테스트 체크리스트
- [ ] 메뉴/선물세트/이바지 상품 목록 로딩
- [ ] 상품 상세 페이지
- [ ] 회원가입/로그인 (이메일, 카카오)
- [ ] 장바구니 담기/조회
- [ ] 검색 기능
- [ ] 지도 표시 (Google Maps embed)
- [ ] 모바일 반응형

---

## 도메인 이전 (jinjood.com)

### 1. 기존 HTML 사이트 DNS 설정 백업
- 현재 DNS 레코드 스크린샷 저장

### 2. Vercel에서 도메인 추가
- Project > Settings > Domains > Add
- `jinjood.com` 입력

### 3. DNS 레코드 변경
- 기존 호스팅의 DNS에서 A 레코드 또는 CNAME을 Vercel 값으로 변경
- Vercel이 안내하는 값으로 설정
- 예시:
  - A 레코드: `76.76.21.21`
  - CNAME: `cname.vercel-dns.com`

### 4. DNS 전파 대기
- 최대 48시간 (보통 몇 분~몇 시간)

### 5. Supabase 설정 업데이트 (카카오 로그인)
- Supabase Dashboard > Authentication > URL Configuration
- Site URL: `https://jinjood.com`
- Redirect URLs에 `https://jinjood.com/**` 추가

### 6. 도메인 이전 전 체크
- [ ] 기존 사이트의 중요 URL이 새 사이트에도 있는지 확인
- [ ] 없어진 URL은 리다이렉트 설정 고려 (SEO 영향)
  - 예: `/menu.html` → `/represent`

---

## Supabase 설정

### 장바구니 테이블 생성
Supabase SQL Editor에서 `supabase/cart_items.sql` 실행 필요

### 카카오 OAuth 설정
1. [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
2. Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase Dashboard > Authentication > Providers > Kakao 활성화

---

## 프로젝트 구조

```
app/                    # Next.js App Router 페이지
├── page.tsx            # 홈페이지
├── represent/          # 대표 메뉴
├── gifts/              # 선물 세트
├── reciprocate/        # 이바지 & 답례
├── contact/            # 오시는 길
├── cart/               # 장바구니
├── mypage/             # 마이페이지
└── (auth)/             # 로그인/회원가입

src/
├── components/         # React 컴포넌트
├── hooks/              # 커스텀 훅
├── stores/             # Zustand 스토어
├── services/           # API 서비스
├── types/              # TypeScript 타입
└── data/               # 샘플 데이터
```

---

## 개발자 정보

- **Developer**: [김민태](https://github.com/mintae1117)
- **Site Admin**: 조장현
