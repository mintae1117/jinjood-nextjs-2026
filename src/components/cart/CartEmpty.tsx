"use client";

import styled from "styled-components";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";

const EmptyWrapper = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 50%;

  svg {
    font-size: 2.5rem;
    color: #cccccc;
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 280px;
  margin: 0 auto;
`;

const PrimaryButton = styled(Link)`
  display: block;
  padding: 0.875rem 2rem;
  background-color: #f35525;
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  text-align: center;

  &:hover {
    background-color: #d94820;
  }
`;

const SecondaryButton = styled(Link)`
  display: block;
  padding: 0.875rem 2rem;
  background-color: transparent;
  color: #666666;
  font-weight: 500;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: #f35525;
    color: #f35525;
  }
`;

export default function CartEmpty() {
  return (
    <EmptyWrapper>
      <IconWrapper>
        <FiShoppingCart />
      </IconWrapper>
      <Title>장바구니가 비어있습니다</Title>
      <Description>
        원하시는 상품을 장바구니에 담아보세요.
        <br />
        진주떡집의 맛있는 떡이 기다리고 있습니다.
      </Description>
      <ButtonGroup>
        <PrimaryButton href="/represent">대표 메뉴 보기</PrimaryButton>
        <SecondaryButton href="/gifts">선물세트 보기</SecondaryButton>
      </ButtonGroup>
    </EmptyWrapper>
  );
}
