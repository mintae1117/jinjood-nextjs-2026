import { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기 | 진주떡집",
  description: "진주떡집 비밀번호 찾기 페이지입니다.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
