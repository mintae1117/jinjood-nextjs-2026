"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { RiKakaoTalkFill } from "react-icons/ri";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/hooks";
import type { LoginFormData } from "@/types";

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
  margin-bottom: 2rem;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999999;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #666666;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: #999999;
  font-size: 0.875rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: #eeeeee;
  }
`;

const KakaoButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background-color: #fee500;
  color: #000000;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #e6cf00;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.25rem;
  }
`;

const Links = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;

  a {
    color: #666666;
    transition: color 0.2s ease;

    &:hover {
      color: #f35525;
    }
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

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const { signIn, signInWithKakao, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.email || !formData.password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const result = await signIn(formData);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || "로그인에 실패했습니다.");
    }
  };

  const handleKakaoLogin = async () => {
    setError(null);
    const result = await signInWithKakao();

    if (!result.success) {
      setError(result.error || "카카오 로그인에 실패했습니다.");
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Logo href="/">진주떡집</Logo>
        <Title>로그인</Title>

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
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </SubmitButton>
        </Form>

        <Divider>또는</Divider>

        <KakaoButton onClick={handleKakaoLogin} disabled={isLoading}>
          <RiKakaoTalkFill />
          카카오로 시작하기
        </KakaoButton>

        <Links>
          <Link href="/register">회원가입</Link>
          <Link href="/forgot-password">비밀번호 찾기</Link>
        </Links>
      </FormWrapper>
    </Container>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<Container><FormWrapper>로딩 중...</FormWrapper></Container>}>
      <LoginFormInner />
    </Suspense>
  );
}
