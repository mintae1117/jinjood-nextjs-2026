import type { Metadata } from "next";

// 마이페이지는 클라이언트 컴포넌트라 page 에서 metadata 를 내보낼 수 없어 layout 에 둔다.
// 로그인 사용자 전용 화면이라 색인하지 않는다(robots.txt 는 /mypage/ 하위만 막고 /mypage 자체는 열려 있다).
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
