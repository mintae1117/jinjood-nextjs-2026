"use client";

import styled from "styled-components";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { useAuth, useCart } from "@/hooks";
import { Loading } from "@/components/common/Loading";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CartEmpty from "./CartEmpty";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  background-color: #f8f8f8;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Inner = styled.div`
  max-width: 1200px;
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

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ItemCount = styled.div`
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eeeeee;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
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

export default function CartContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { items, isLoading, totalItems, updateQuantity, removeFromCart } = useCart();

  // 초기화 중
  if (!isInitialized) {
    return (
      <Container>
        <Inner>
          <Loading minHeight="400px" text="장바구니를 불러오는 중..." />
        </Inner>
      </Container>
    );
  }

  // 로그인 필요
  if (!isAuthenticated) {
    return (
      <Container>
        <Inner>
          <Header>
            <BackLink href="/">
              <FiArrowLeft />
            </BackLink>
            <Title>장바구니</Title>
          </Header>

          <LoginPrompt>
            <PromptTitle>로그인이 필요합니다</PromptTitle>
            <PromptDescription>
              장바구니 기능을 이용하시려면 로그인해주세요.
            </PromptDescription>
            <LoginButton href="/login?redirectTo=/cart">로그인하기</LoginButton>
          </LoginPrompt>
        </Inner>
      </Container>
    );
  }

  // 장바구니가 비어있음
  if (!isLoading && items.length === 0) {
    return (
      <Container>
        <Inner>
          <Header>
            <BackLink href="/">
              <FiArrowLeft />
            </BackLink>
            <Title>장바구니</Title>
          </Header>

          <CartEmpty />
        </Inner>
      </Container>
    );
  }

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    await updateQuantity(itemId, quantity);
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  return (
    <Container>
      <Inner>
        <Header>
          <BackLink href="/">
            <FiArrowLeft />
          </BackLink>
          <Title>장바구니</Title>
        </Header>

        <ContentWrapper>
          <CartItemsWrapper>
            <ItemCount>총 {totalItems}개의 상품</ItemCount>

            {isLoading ? (
              <Loading minHeight="200px" text="상품을 불러오는 중..." />
            ) : (
              <ItemList>
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </ItemList>
            )}
          </CartItemsWrapper>

          <CartSummary />
        </ContentWrapper>
      </Inner>
    </Container>
  );
}
