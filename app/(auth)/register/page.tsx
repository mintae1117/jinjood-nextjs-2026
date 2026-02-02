import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "회원가입 | 진주떡집",
  description: "진주떡집 회원가입 페이지입니다.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
