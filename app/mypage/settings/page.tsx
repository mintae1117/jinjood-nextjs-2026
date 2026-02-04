"use client";

import { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { FiArrowLeft, FiBell, FiMail, FiSmartphone, FiMoon, FiSave } from "react-icons/fi";
import { useAuth } from "@/hooks";
import { Loading } from "@/components/common/Loading";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  background-color: #f8f8f8;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Inner = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #1e1e1e;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f35525;
    color: #ffffff;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1e1e;
`;

const SettingsSection = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem 1.5rem;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SettingIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  font-size: 1.125rem;
`;

const SettingText = styled.div``;

const SettingTitle = styled.span`
  display: block;
  font-weight: 500;
  color: #1e1e1e;
`;

const SettingDescription = styled.span`
  display: block;
  font-size: 0.8125rem;
  color: #999999;
  margin-top: 0.25rem;
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 50px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $active }) => ($active ? "#f35525" : "#e0e0e0")};
  position: relative;
  transition: background-color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ $active }) => ($active ? "25px" : "3px")};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 12px;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #d94820;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: "success" | "error" }>`
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: ${({ $type }) => ($type === "success" ? "#ecfdf5" : "#fef2f2")};
  color: ${({ $type }) => ($type === "success" ? "#059669" : "#dc2626")};
  margin-bottom: 1rem;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const PromptTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const PromptDescription = styled.p`
  color: #666666;
  margin-bottom: 1.5rem;
`;

const LoginButton = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  background-color: #f35525;
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d94820;
  }
`;

export default function SettingsPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [settings, setSettings] = useState({
    pushNotification: true,
    emailNotification: true,
    smsNotification: false,
    darkMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isInitialized) {
    return (
      <Container>
        <Inner>
          <Loading minHeight="400px" text="로딩 중..." />
        </Inner>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Inner>
          <Header>
            <BackLink href="/mypage">
              <FiArrowLeft />
            </BackLink>
            <Title>설정</Title>
          </Header>
          <LoginPrompt>
            <PromptTitle>로그인이 필요합니다</PromptTitle>
            <PromptDescription>
              설정을 변경하려면 로그인해주세요.
            </PromptDescription>
            <LoginButton href="/login?redirectTo=/mypage/settings">로그인하기</LoginButton>
          </LoginPrompt>
        </Inner>
      </Container>
    );
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    // TODO: 실제 API 연동
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessage({ type: "success", text: "설정이 저장되었습니다." });
    setIsSaving(false);
  };

  return (
    <Container>
      <Inner>
        <Header>
          <BackLink href="/mypage">
            <FiArrowLeft />
          </BackLink>
          <Title>설정</Title>
        </Header>

        {message && <Message $type={message.type}>{message.text}</Message>}

        <SettingsSection>
          <SectionTitle>알림 설정</SectionTitle>

          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <FiBell />
              </SettingIcon>
              <SettingText>
                <SettingTitle>푸시 알림</SettingTitle>
                <SettingDescription>주문 상태 및 이벤트 알림</SettingDescription>
              </SettingText>
            </SettingInfo>
            <Toggle
              $active={settings.pushNotification}
              onClick={() => handleToggle("pushNotification")}
            />
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <FiMail />
              </SettingIcon>
              <SettingText>
                <SettingTitle>이메일 알림</SettingTitle>
                <SettingDescription>프로모션 및 소식 이메일</SettingDescription>
              </SettingText>
            </SettingInfo>
            <Toggle
              $active={settings.emailNotification}
              onClick={() => handleToggle("emailNotification")}
            />
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <FiSmartphone />
              </SettingIcon>
              <SettingText>
                <SettingTitle>SMS 알림</SettingTitle>
                <SettingDescription>문자 메시지 알림</SettingDescription>
              </SettingText>
            </SettingInfo>
            <Toggle
              $active={settings.smsNotification}
              onClick={() => handleToggle("smsNotification")}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>화면 설정</SectionTitle>

          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <FiMoon />
              </SettingIcon>
              <SettingText>
                <SettingTitle>다크 모드</SettingTitle>
                <SettingDescription>어두운 테마 사용 (준비 중)</SettingDescription>
              </SettingText>
            </SettingInfo>
            <Toggle
              $active={settings.darkMode}
              onClick={() => handleToggle("darkMode")}
            />
          </SettingItem>
        </SettingsSection>

        <SaveButton onClick={handleSave} disabled={isSaving}>
          <FiSave />
          {isSaving ? "저장 중..." : "설정 저장"}
        </SaveButton>
      </Inner>
    </Container>
  );
}
