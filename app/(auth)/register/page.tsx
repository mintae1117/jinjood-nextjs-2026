import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "회원가입 | 진주떡집",
  description: "진주떡집 회원가입 페이지입니다.",
  // 검색 결과에 나올 이유가 없는 기능 페이지 — 색인하지 않는다(링크는 따라가도 됨)
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
