"use client";

import { useParams } from "next/navigation";
import { useGiftSet } from "@/hooks";
import ProductDetail from "@/components/product/ProductDetail";
import styled from "styled-components";
import { motion } from "framer-motion";

const LoadingContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled(motion.div)`
  width: 48px;
  height: 48px;
  border: 3px solid #f8f8f8;
  border-top-color: #f35525;
  border-radius: 50%;
`;

const ErrorContainer = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`;

const ErrorTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1e1e;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: #666666;
`;

const BackLink = styled.a`
  padding: 0.75rem 1.5rem;
  background-color: #f35525;
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d94820;
  }
`;

export default function GiftSetDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { item, isLoading, error } = useGiftSet(id);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </LoadingContainer>
    );
  }

  if (error || !item) {
    return (
      <ErrorContainer>
        <ErrorTitle>상품을 찾을 수 없습니다</ErrorTitle>
        <ErrorMessage>
          요청하신 선물세트가 존재하지 않거나 현재 판매 중이 아닙니다.
        </ErrorMessage>
        <BackLink href="/gifts">선물세트 목록으로 돌아가기</BackLink>
      </ErrorContainer>
    );
  }

  return (
    <ProductDetail
      product={item}
      productType="gift_set"
      backLink="/gifts"
      backLabel="선물세트 목록"
    />
  );
}
