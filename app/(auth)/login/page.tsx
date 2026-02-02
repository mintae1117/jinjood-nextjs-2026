import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | 진주떡집",
  description: "진주떡집 로그인 페이지입니다.",
};

export default function LoginPage() {
  return <LoginForm />;
}
