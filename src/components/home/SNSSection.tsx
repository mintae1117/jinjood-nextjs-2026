"use client";

import { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

const Section = styled.section`
  padding: 5rem 0;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionSubtitle = styled.span`
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f35525;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const TabsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const TabButton = styled.button<{ $active: boolean; $color: string; $isGradient?: boolean; $textColor?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 30px;
  background: ${({ $active, $color, $isGradient }) =>
    $active
      ? ($isGradient ? $color : $color)
      : "#f8f8f8"
  };
  color: ${({ $active, $textColor }) => ($active ? ($textColor || "#ffffff") : "#666666")};
  transition: all 0.3s ease;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    background: ${({ $active, $color, $isGradient }) =>
      $active
        ? ($isGradient ? $color : $color)
        : "#eeeeee"
    };
    opacity: ${({ $active }) => ($active ? 0.9 : 1)};
  }

  @media (max-width: 480px) {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  min-height: 280px;
`;

const TabContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
`;

const SNSIcon = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
`;

const SNSTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const SNSDescription = styled.p`
  font-size: 1rem;
  color: #666666;
  line-height: 1.8;
  max-width: 500px;
  margin-bottom: 1.5rem;
`;

const SNSLink = styled.a<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: ${({ $color }) => $color};
  color: #ffffff;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const snsData = [
  {
    id: "instagram",
    icon: FaInstagram,
    color: "linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
    isGradient: true,
    title: "인스타그램",
    description:
      "진주떡집의 일상과 신제품 소식을 실시간으로 만나보세요. 매일 업데이트되는 맛있는 떡 사진과 함께 소통해요!",
    link: "https://www.instagram.com/busan_jinjoods_rice_cake",
    linkText: "인스타그램 팔로우하기",
  },
  {
    id: "kakao",
    icon: RiKakaoTalkFill,
    color: "#FEE500",
    textColor: "#1e1e1e",
    title: "카카오 채널",
    description:
      "카카오 채널을 추가하시면 새로운 메뉴 소식과 할인 정보를 가장 먼저 받아보실 수 있습니다.",
    link: "https://pf.kakao.com/_zsKlb",
    linkText: "카카오 채널 추가하기",
  },
  {
    id: "naver",
    icon: SiNaver,
    color: "#03C75A",
    title: "네이버 밴드",
    description:
      "네이버 밴드에서 다른 고객님들과 함께 떡 이야기를 나눠보세요. 후기와 추천 메뉴를 공유합니다.",
    link: "https://band.us/band/77842984",
    linkText: "네이버 밴드 가입하기",
  },
];

export default function SNSSection() {
  const [activeTab, setActiveTab] = useState("instagram");

  const activeData =
    snsData.find((item) => item.id === activeTab) || snsData[0];
  const IconComponent = activeData.icon;

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionSubtitle>Follow Us</SectionSubtitle>
          <SectionTitle>SNS에서 만나요</SectionTitle>
        </SectionHeader>

        <TabsWrapper>
          {snsData.map((item) => {
            const TabIcon = item.icon;
            return (
              <TabButton
                key={item.id}
                $active={activeTab === item.id}
                $color={item.color}
                $isGradient={item.isGradient}
                $textColor={item.textColor}
                onClick={() => setActiveTab(item.id)}
              >
                <TabIcon />
                {item.title}
              </TabButton>
            );
          })}
        </TabsWrapper>

        <ContentWrapper>
          <AnimatePresence mode="wait">
            <TabContent
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SNSIcon $color={activeData.color}>
                <IconComponent
                  style={{ color: activeData.textColor || "#ffffff" }}
                />
              </SNSIcon>
              <SNSTitle>{activeData.title}</SNSTitle>
              <SNSDescription>{activeData.description}</SNSDescription>
              <SNSLink
                href={activeData.link}
                target="_blank"
                rel="noopener noreferrer"
                $color={activeData.color}
                style={{ color: activeData.textColor || "#ffffff" }}
              >
                {activeData.linkText}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 12L12 4M12 4H6M12 4V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </SNSLink>
            </TabContent>
          </AnimatePresence>
        </ContentWrapper>
      </Container>
    </Section>
  );
}
