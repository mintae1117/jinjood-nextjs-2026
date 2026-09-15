"use client";

import ProductDetail from "@/components/product/ProductDetail";
import type { ProductType } from "@/types";
import type { EditableProduct } from "@/utils/adminProduct";
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

interface ProductDetailShellProps {
  /** 훅이 돌려준 상품. null이면 "찾을 수 없습니다" */
  item: EditableProduct | null;
  isLoading: boolean;
  /** 관리자 수정 후 갱신 */
  onSaved: () => void;
  productType: ProductType;
  /** 목록으로 돌아가는 경로 */
  backLink: string;
  backLabel: string;
  /** 못 찾았을 때 안내 문구 */
  notFoundMessage: string;
  notFoundLinkLabel: string;
}

/**
 * 상세 3종(대표메뉴·선물세트·이바지답례)이 공유하는 껍데기.
 *
 * 훅은 종류마다 달라 각 라우트의 클라이언트가 직접 부르고(훅 규칙),
 * 로딩·못 찾음·본문 렌더만 여기로 모았다.
 */
export default function ProductDetailShell({
  item,
  isLoading,
  onSaved,
  productType,
  backLink,
  backLabel,
  notFoundMessage,
  notFoundLinkLabel,
}: ProductDetailShellProps) {
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

  if (!item) {
    return (
      <ErrorContainer>
        <ErrorTitle>상품을 찾을 수 없습니다</ErrorTitle>
        <ErrorMessage>{notFoundMessage}</ErrorMessage>
        <BackLink href={backLink}>{notFoundLinkLabel}</BackLink>
      </ErrorContainer>
    );
  }

  return (
    <ProductDetail
      product={item}
      productType={productType}
      backLink={backLink}
      backLabel={backLabel}
      onSaved={onSaved}
    />
  );
}
