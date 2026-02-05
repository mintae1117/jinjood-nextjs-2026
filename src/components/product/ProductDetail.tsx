"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FiMinus, FiPlus, FiShoppingCart, FiArrowLeft, FiPhone } from "react-icons/fi";
import { useAuth, useCart } from "@/hooks";
import type { MenuItem, GiftSet, ReciprocateItem, ProductType } from "@/types";
import { getStorageUrl } from "@/lib/supabase";

type ProductItem = MenuItem | GiftSet | ReciprocateItem;

interface ProductDetailProps {
  product: ProductItem;
  productType: ProductType;
  backLink: string;
  backLabel: string;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: #666666;

  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666666;
    transition: color 0.2s ease;

    &:hover {
      color: #f35525;
    }
  }
`;

const ProductWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled(motion.div)`
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background-color: #f8f8f8;
`;

const ProductImage = styled(Image)`
  object-fit: cover;
`;

const TagsWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  z-index: 10;
`;

const Tag = styled.span<{ $variant?: "popular" | "best" | "recommended" }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${({ $variant }) => {
    switch ($variant) {
      case "popular":
        return "#f35525";
      case "best":
        return "#1e1e1e";
      case "recommended":
        return "#22c55e";
      default:
        return "#666666";
    }
  }};
  color: #ffffff;
`;

const InfoSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
`;

const Category = styled.span`
  font-size: 0.875rem;
  color: #f35525;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Price = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1.5rem;

  span {
    font-size: 1rem;
    font-weight: 400;
    color: #666666;
  }
`;

const Description = styled.p`
  font-size: 1rem;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 2rem;
  white-space: pre-line;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eeeeee;
  margin: 1.5rem 0;
`;

const ItemsSection = styled.div`
  margin-bottom: 2rem;
`;

const ItemsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.75rem;
`;

const ItemsList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ItemTag = styled.li`
  padding: 0.5rem 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #666666;
`;

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const QuantityLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1e1e;
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
  width: 36px;
  height: 36px;
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
  min-width: 48px;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  color: #1e1e1e;
`;

const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const TotalLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #1e1e1e;
`;

const TotalValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f35525;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled(motion.button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background-color: #1e1e1e;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #333333;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const BuyNowButton = styled(motion.button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background-color: #f35525;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
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

const InquiryButton = styled(Link)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background-color: #f35525;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d94820;
  }
`;

const LoginPrompt = styled.div`
  padding: 1rem;
  background-color: #fef3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #856404;
  text-align: center;

  a {
    color: #f35525;
    font-weight: 600;
    text-decoration: underline;
  }
`;

const SuccessMessage = styled(motion.div)`
  padding: 1rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #155724;
  text-align: center;
`;

const getCategoryLabel = (category: string, productType: ProductType): string => {
  if (productType === "menu_item") {
    switch (category) {
      case "chapssaltteok":
        return "찹쌀떡";
      case "mepssaltteok":
        return "멥쌀떡";
      case "tteokguk":
        return "떡국";
      case "others":
        return "기타";
      default:
        return "";
    }
  } else if (productType === "gift_set") {
    switch (category) {
      case "gift_set":
        return "선물 세트";
      case "songpyeon_set":
        return "송편/떡국 세트";
      case "baekil_dol_set":
        return "백일&돌 세트";
      default:
        return "";
    }
  } else {
    switch (category) {
      case "ibaji":
        return "이바지";
      case "daprye":
        return "답례";
      default:
        return "";
    }
  }
};

export default function ProductDetail({
  product,
  productType,
  backLink,
  backLabel,
}: ProductDetailProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const isMenuItem = productType === "menu_item";
  const isGiftSet = productType === "gift_set";
  const isReciprocate = productType === "reciprocate_item";

  const menuItem = isMenuItem ? (product as MenuItem) : null;
  const giftSet = isGiftSet ? (product as GiftSet) : null;

  const totalPrice = product.price * quantity;

  const imageUrl = getStorageUrl(product.image_url);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return;

    const result = await addToCart({
      product_id: product.id,
      product_type: productType,
      quantity,
    });

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const result = await addToCart({
      product_id: product.id,
      product_type: productType,
      quantity,
    });

    if (result.success) {
      router.push("/cart");
    }
  };

  return (
    <Container>
      <Breadcrumb>
        <Link href={backLink}>
          <FiArrowLeft />
          {backLabel}
        </Link>
      </Breadcrumb>

      <ProductWrapper>
        <ImageSection
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProductImage src={imageUrl} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" priority unoptimized />
          {menuItem && (
            <TagsWrapper>
              {menuItem.is_popular && <Tag $variant="popular">인기</Tag>}
              {menuItem.is_best && <Tag $variant="best">베스트</Tag>}
              {menuItem.is_recommended && <Tag $variant="recommended">추천</Tag>}
            </TagsWrapper>
          )}
        </ImageSection>

        <InfoSection
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Category>{getCategoryLabel(product.category, productType)}</Category>
          <ProductName>{product.name}</ProductName>
          <Price>
            {product.price.toLocaleString("ko-KR")}원
            {isReciprocate && <span> ~</span>}
          </Price>

          {product.description && <Description>{product.description}</Description>}

          {giftSet && giftSet.items && giftSet.items.length > 0 && (
            <ItemsSection>
              <ItemsTitle>구성품</ItemsTitle>
              <ItemsList>
                {giftSet.items.map((item, index) => (
                  <ItemTag key={index}>{item}</ItemTag>
                ))}
              </ItemsList>
            </ItemsSection>
          )}

          <Divider />

          {!isReciprocate && (
            <>
              <QuantitySection>
                <QuantityLabel>수량</QuantityLabel>
                <QuantityControl>
                  <QuantityButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="수량 감소"
                  >
                    <FiMinus />
                  </QuantityButton>
                  <Quantity>{quantity}</Quantity>
                  <QuantityButton onClick={() => handleQuantityChange(1)} aria-label="수량 증가">
                    <FiPlus />
                  </QuantityButton>
                </QuantityControl>
              </QuantitySection>

              <TotalPrice>
                <TotalLabel>총 상품 금액</TotalLabel>
                <TotalValue>{totalPrice.toLocaleString("ko-KR")}원</TotalValue>
              </TotalPrice>

              {!isAuthenticated && (
                <LoginPrompt>
                  장바구니 및 구매를 이용하시려면{" "}
                  <Link href={`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`}>
                    로그인
                  </Link>
                  해주세요.
                </LoginPrompt>
              )}

              {showSuccess && (
                <SuccessMessage
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  장바구니에 상품이 추가되었습니다.
                </SuccessMessage>
              )}

              <ButtonGroup>
                <AddToCartButton
                  onClick={handleAddToCart}
                  disabled={!isAuthenticated || cartLoading}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiShoppingCart />
                  장바구니 담기
                </AddToCartButton>
                <BuyNowButton
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  whileTap={{ scale: 0.98 }}
                >
                  바로 구매하기
                </BuyNowButton>
              </ButtonGroup>
            </>
          )}

          {isReciprocate && (
            <>
              <LoginPrompt style={{ backgroundColor: "#e8f4f8", borderColor: "#bee5eb", color: "#0c5460" }}>
                이바지떡과 답례떡은 행사 규모와 예산에 맞춰 맞춤 구성이 가능합니다.
              </LoginPrompt>
              <ButtonGroup>
                <InquiryButton href="/contact">
                  <FiPhone />
                  전화 문의하기
                </InquiryButton>
              </ButtonGroup>
            </>
          )}
        </InfoSection>
      </ProductWrapper>
    </Container>
  );
}
