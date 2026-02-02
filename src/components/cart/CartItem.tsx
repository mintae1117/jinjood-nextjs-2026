"use client";

import styled from "styled-components";
import Image from "next/image";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import type { CartItem as CartItemType, MenuItem, GiftSet, ReciprocateItem } from "@/types";
import { getImageUrl } from "@/lib/supabase";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const ItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #eeeeee;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 640px) {
    grid-template-columns: 80px 1fr;
    gap: 0.75rem;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f8f8f8;

  @media (max-width: 640px) {
    width: 80px;
    height: 80px;
  }
`;

const ProductImage = styled(Image)`
  object-fit: cover;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProductType = styled.span`
  font-size: 0.75rem;
  color: #999999;
  margin-bottom: 0.25rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const Price = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #f35525;
`;

const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;

  @media (max-width: 640px) {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 0.25rem;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #1e1e1e;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #f35525;
    color: #ffffff;
  }

  &:disabled {
    color: #cccccc;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #1e1e1e;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: #999999;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #dc2626;
  }
`;

const getProductTypeName = (type: string): string => {
  switch (type) {
    case "menu_item":
      return "대표 메뉴";
    case "gift_set":
      return "선물세트";
    case "reciprocate_item":
      return "이바지/답례";
    default:
      return "";
  }
};

const getProductInfo = (
  product: MenuItem | GiftSet | ReciprocateItem | undefined
): { name: string; price: number; imageUrl: string } => {
  if (!product) {
    return { name: "상품 정보 없음", price: 0, imageUrl: "" };
  }

  return {
    name: product.name,
    price: product.price,
    imageUrl: product.image_url || "",
  };
};

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const { name, price, imageUrl } = getProductInfo(item.product);
  const typeName = getProductTypeName(item.product_type);

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const formattedPrice = (price * item.quantity).toLocaleString("ko-KR");

  // 이미지 URL 처리
  const resolvedImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : imageUrl
    ? getImageUrl("images", imageUrl)
    : "/images/placeholder.png";

  return (
    <ItemWrapper>
      <ImageWrapper>
        <ProductImage
          src={resolvedImageUrl}
          alt={name}
          fill
          sizes="100px"
        />
      </ImageWrapper>

      <InfoWrapper>
        <ProductType>{typeName}</ProductType>
        <ProductName>{name}</ProductName>
        <Price>{formattedPrice}원</Price>
      </InfoWrapper>

      <ActionsWrapper>
        <QuantityControl>
          <QuantityButton
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            aria-label="수량 감소"
          >
            <FiMinus />
          </QuantityButton>
          <Quantity>{item.quantity}</Quantity>
          <QuantityButton onClick={handleIncrease} aria-label="수량 증가">
            <FiPlus />
          </QuantityButton>
        </QuantityControl>

        <RemoveButton onClick={() => onRemove(item.id)}>
          <FiTrash2 />
          삭제
        </RemoveButton>
      </ActionsWrapper>
    </ItemWrapper>
  );
}
