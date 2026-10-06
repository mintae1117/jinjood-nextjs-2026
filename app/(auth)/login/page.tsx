import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | 진주떡집",
  description: "진주떡집 로그인 페이지입니다.",
  // 검색 결과에 나올 이유가 없는 기능 페이지 — 색인하지 않는다(링크는 따라가도 됨)
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginForm />;
}
