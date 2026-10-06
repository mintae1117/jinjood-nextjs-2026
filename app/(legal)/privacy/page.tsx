import { Metadata } from "next";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 진주떡집",
  description: "진주떡집 개인정보처리방침입니다.",
  alternates: {
    canonical: "https://www.jinjood.com/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
