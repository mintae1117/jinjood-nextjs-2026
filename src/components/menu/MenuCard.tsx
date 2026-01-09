"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MenuItem } from "@/types";

const Card = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;

  img {
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${Card}:hover & img {
    transform: scale(1.05);
  }
`;

const TagsWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
`;

const Tag = styled.span<{ $variant?: "popular" | "best" | "recommended" }>`
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  background-color: ${({ $variant }) => {
    switch ($variant) {
      case "popular":
        return "#ff6b6b";
      case "best":
        return "#ffd93d";
      case "recommended":
        return "#6bcb77";
      default:
        return "#f35525";
    }
  }};
  color: ${({ $variant }) => ($variant === "best" ? "#1e1e1e" : "#ffffff")};
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const MenuName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const MenuDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #666666;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-bottom: 0.75rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f35525;
`;

const ViewMoreButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1e1e;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f35525;
    border-color: #f35525;
    color: #ffffff;
  }
`;

const categoryLabels: Record<string, string> = {
  chapssaltteok: "찹쌀떡",
  mepssaltteok: "멥쌀떡",
  tteokguk: "떡국",
  others: "기타",
};

interface MenuCardProps {
  item: MenuItem;
  index?: number;
}

export default function MenuCard({ item, index = 0 }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      <ImageWrapper>
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <TagsWrapper>
          {item.is_popular && <Tag $variant="popular">인기</Tag>}
          {item.is_best && <Tag $variant="best">베스트</Tag>}
          {item.is_recommended && <Tag $variant="recommended">추천</Tag>}
        </TagsWrapper>
      </ImageWrapper>
      <CardContent>
        <CategoryBadge>
          {categoryLabels[item.category] || item.category}
        </CategoryBadge>
        <MenuName>{item.name}</MenuName>
        <MenuDescription>{item.description}</MenuDescription>
        <PriceRow>
          <Price>{formatPrice(item.price)}원</Price>
          <ViewMoreButton href={`/represent/${item.id}`}>
            자세히 보기
          </ViewMoreButton>
        </PriceRow>
      </CardContent>
    </Card>
  );
}
