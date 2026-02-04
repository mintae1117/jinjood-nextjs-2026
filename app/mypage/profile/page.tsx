"use client";

import { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiSave } from "react-icons/fi";
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

const ProfileSection = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f35525;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const AvatarName = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e1e1e;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999999;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  font-size: 1rem;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #f35525;
  }

  &:disabled {
    background-color: #f8f8f8;
    color: #666666;
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
  border-radius: 8px;
  transition: background-color 0.2s ease;
  margin-top: 1rem;

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

export default function ProfilePage() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
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

  if (!isAuthenticated || !user) {
    return (
      <Container>
        <Inner>
          <Header>
            <BackLink href="/mypage">
              <FiArrowLeft />
            </BackLink>
            <Title>프로필 설정</Title>
          </Header>
          <LoginPrompt>
            <PromptTitle>로그인이 필요합니다</PromptTitle>
            <PromptDescription>
              프로필을 관리하려면 로그인해주세요.
            </PromptDescription>
            <LoginButton href="/login?redirectTo=/mypage/profile">로그인하기</LoginButton>
          </LoginPrompt>
        </Inner>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // TODO: 실제 API 연동
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessage({ type: "success", text: "프로필이 저장되었습니다." });
    setIsSaving(false);
  };

  const getInitial = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <Container>
      <Inner>
        <Header>
          <BackLink href="/mypage">
            <FiArrowLeft />
          </BackLink>
          <Title>프로필 설정</Title>
        </Header>

        <ProfileSection>
          <AvatarSection>
            <Avatar>{getInitial()}</Avatar>
            <AvatarName>{user.name || user.email}</AvatarName>
          </AvatarSection>

          {message && <Message $type={message.type}>{message.text}</Message>}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>이메일</Label>
              <InputWrapper>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input type="email" value={user.email} disabled />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>이름</Label>
              <InputWrapper>
                <InputIcon>
                  <FiUser />
                </InputIcon>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>연락처</Label>
              <InputWrapper>
                <InputIcon>
                  <FiPhone />
                </InputIcon>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="연락처를 입력하세요"
                />
              </InputWrapper>
            </FormGroup>

            <SaveButton type="submit" disabled={isSaving}>
              <FiSave />
              {isSaving ? "저장 중..." : "저장하기"}
            </SaveButton>
          </Form>
        </ProfileSection>
      </Inner>
    </Container>
  );
}
