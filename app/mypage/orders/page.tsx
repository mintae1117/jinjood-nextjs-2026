"use client";

import styled from "styled-components";
import Link from "next/link";
import { FiArrowLeft, FiPackage } from "react-icons/fi";
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
  max-width: 800px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #999999;
`;

const EmptyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: #666666;
  margin-bottom: 1.5rem;
`;

const ShopButton = styled(Link)`
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

export default function OrdersPage() {
  const { isAuthenticated, isInitialized } = useAuth();

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
            <Title>주문 내역</Title>
          </Header>
          <LoginPrompt>
            <PromptTitle>로그인이 필요합니다</PromptTitle>
            <PromptDescription>
              주문 내역을 확인하려면 로그인해주세요.
            </PromptDescription>
            <LoginButton href="/login?redirectTo=/mypage/orders">로그인하기</LoginButton>
          </LoginPrompt>
        </Inner>
      </Container>
    );
  }

  return (
    <Container>
      <Inner>
        <Header>
          <BackLink href="/mypage">
            <FiArrowLeft />
          </BackLink>
          <Title>주문 내역</Title>
        </Header>

        <EmptyState>
          <EmptyIcon>
            <FiPackage />
          </EmptyIcon>
          <EmptyTitle>주문 내역이 없습니다</EmptyTitle>
          <EmptyDescription>
            아직 주문한 상품이 없어요.<br />
            맛있는 떡을 주문해보세요!
          </EmptyDescription>
          <ShopButton href="/represent">쇼핑하러 가기</ShopButton>
        </EmptyState>
      </Inner>
    </Container>
  );
}
