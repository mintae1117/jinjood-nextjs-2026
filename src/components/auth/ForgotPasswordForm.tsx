"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "@/hooks";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f8f8f8;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666666;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #f35525;
  }
`;

const Logo = styled(Link)`
  display: block;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.75rem;
`;

const Description = styled.p`
  text-align: center;
  color: #666666;
  font-size: 0.875rem;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999999;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #f35525;
    box-shadow: 0 0 0 3px rgba(243, 85, 37, 0.1);
  }

  &::placeholder {
    color: #999999;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background-color: #f35525;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #d94820;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  padding: 0.75rem 1rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.875rem;
`;

export default function ForgotPasswordForm() {
  const { resetPassword, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!email.includes("@")) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(result.message || "비밀번호 재설정 이메일을 발송했습니다.");
      setEmail("");
    } else {
      setError(result.error || "이메일 발송에 실패했습니다.");
    }
  };

  return (
    <Container>
      <FormWrapper>
        <BackLink href="/login">
          <FiArrowLeft />
          로그인으로 돌아가기
        </BackLink>

        <Logo href="/">진주떡집</Logo>
        <Title>비밀번호 찾기</Title>
        <Description>
          가입하신 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다.
        </Description>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiMail />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              autoComplete="email"
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? "발송 중..." : "비밀번호 재설정 이메일 받기"}
          </SubmitButton>
        </Form>
      </FormWrapper>
    </Container>
  );
}
