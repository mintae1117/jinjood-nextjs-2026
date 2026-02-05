import { Metadata } from "next";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "이용약관 | 진주떡집",
  description: "진주떡집 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return <TermsContent />;
}
