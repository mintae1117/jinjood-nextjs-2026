import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 세션 쿠키 갱신이 의미 있는 경로만. 공개 페이지(홈·목록·상세·약관·사이트맵 등)를 넣지 말 것 —
     * 미리 만들어 둔 페이지라도 여기 걸리면 요청마다 서버 함수가 돌고 Supabase 를 호출한다
     * (2026-11 Vercel Active CPU 한도 경고). 로그인·장바구니·관리자 판별은 브라우저 클라이언트가 한다.
     */
    "/mypage/:path*",
    "/checkout",
    "/auth/:path*",
  ],
};
