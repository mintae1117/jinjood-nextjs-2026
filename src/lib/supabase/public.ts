import { createClient } from "@supabase/supabase-js";

/**
 * 공개 데이터 전용 서버 클라이언트 (익명 키, 쿠키를 읽지 않는다)
 *
 * 왜 따로 두는가: `server.ts` 의 클라이언트는 cookies() 를 부르고, 그걸 쓰는 페이지는
 * 전부 요청마다 서버에서 렌더된다(Dynamic). 홈·목록·상세가 보여주는 것은 로그인과 무관한
 * 공개 상품(is_active = true)뿐이라 쿠키가 필요 없다. 이 클라이언트를 쓰면 페이지를
 * 미리 만들어 두고(정적 + revalidate) 크롤러가 와도 서버 함수가 돌지 않는다.
 *
 * 로그인한 사용자 기준으로 조회해야 하는 것(관리자 확인 등)에는 쓰지 말 것 — 항상 익명 권한이다.
 */
export const publicSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
