import { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기 | 진주떡집",
  description: "진주떡집 비밀번호 찾기 페이지입니다.",
  // 검색 결과에 나올 이유가 없는 기능 페이지 — 색인하지 않는다(링크는 따라가도 됨)
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
