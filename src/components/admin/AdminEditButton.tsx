"use client";

import { useState, type MouseEvent } from "react";
import styled from "styled-components";
import { FiEdit2 } from "react-icons/fi";
import type { ProductType } from "@/types";
import { useAuthStore, selectIsAdmin } from "@/stores";
import type { EditableProduct } from "@/utils/adminProduct";
import ProductEditModal from "./ProductEditModal";

/**
 * 관리자에게만 보이는 "수정" 버튼. 모달을 소유한다.
 * - card: 부모가 position: relative인 이미지 래퍼 안에서 우상단 absolute (+ 숨김 배지)
 * - detail: 인라인 텍스트 버튼 (+ 숨김 칩)
 * 관리자가 아니면 아무것도 렌더하지 않는다(disabled 아님).
 */

interface AdminEditButtonProps {
  productType: ProductType;
  product: EditableProduct;
  onSaved: () => void;
  variant?: "card" | "detail";
}

const CardWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HiddenBadge = styled.span`
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #666666;
  border-radius: 20px;
`;

const CardButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #ffffff;
  background-color: rgba(30, 30, 30, 0.75);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f35525;
  }
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DetailButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1e1e;
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f35525;
    border-color: #f35525;
    color: #ffffff;
  }
`;

export default function AdminEditButton({
  productType,
  product,
  onSaved,
  variant = "card",
}: AdminEditButtonProps) {
  const isAdmin = useAuthStore(selectIsAdmin);
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  const isHidden = product.is_active === false;

  // 카드 전체가 Link/hover 영역이라 버블링·기본동작을 끊는다
  const handleOpen = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const modal = open ? (
    <ProductEditModal
      productType={productType}
      product={product}
      onClose={() => setOpen(false)}
      onSaved={onSaved}
    />
  ) : null;

  if (variant === "detail") {
    return (
      <>
        <DetailRow>
          <DetailButton type="button" onClick={handleOpen}>
            <FiEdit2 size={14} />
            상품 수정
          </DetailButton>
          {isHidden && <HiddenBadge>숨김 상태</HiddenBadge>}
        </DetailRow>
        {modal}
      </>
    );
  }

  return (
    <>
      <CardWrapper>
        {isHidden && <HiddenBadge>숨김</HiddenBadge>}
        <CardButton type="button" onClick={handleOpen} aria-label={`${product.name} 수정`}>
          <FiEdit2 size={16} />
        </CardButton>
      </CardWrapper>
      {modal}
    </>
  );
}
