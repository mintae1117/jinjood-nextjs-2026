"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/hooks";
import type { RegisterFormData } from "@/types";

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
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #d94820;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Links = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #666666;

  a {
    color: #f35525;
    margin-left: 0.5rem;

    &:hover {
      text-decoration: underline;
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

const InputHint = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #999999;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
`;

export default function RegisterForm() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email) return "이메일을 입력해주세요.";
    if (!formData.email.includes("@")) return "올바른 이메일 형식을 입력해주세요.";
    if (!formData.password) return "비밀번호를 입력해주세요.";
    if (formData.password.length < 6) return "비밀번호는 6자 이상이어야 합니다.";
    if (formData.password !== formData.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    if (!formData.name) return "이름을 입력해주세요.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await signUp(formData);

    if (result.success) {
      setSuccess(result.message || "회원가입이 완료되었습니다.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(result.error || "회원가입에 실패했습니다.");
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Logo href="/">진주떡집</Logo>
        <Title>회원가입</Title>

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
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>
          <InputHint>6자 이상 입력해주세요</InputHint>

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirm"
              placeholder="비밀번호 확인"
              value={formData.passwordConfirm}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              tabIndex={-1}
            >
              {showPasswordConfirm ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiUser />
            </InputIcon>
            <Input
              type="text"
              name="name"
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="name"
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiPhone />
            </InputIcon>
            <Input
              type="tel"
              name="phone"
              placeholder="연락처 (선택)"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="tel"
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입"}
          </SubmitButton>
        </Form>

        <Links>
          이미 계정이 있으신가요?
          <Link href="/login">로그인</Link>
        </Links>
      </FormWrapper>
    </Container>
  );
}
