"use client";

import { useState, useMemo } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import MenuFilter from "@/components/menu/MenuFilter";
import { sampleGiftSets } from "@/data/sampleData";
import { GiftCategory } from "@/types";

const Section = styled.section`
  padding: 4rem 0;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 2.5rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const GiftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const GiftCard = styled(motion.div)`
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
  aspect-ratio: 1;
  overflow: hidden;

  img {
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${GiftCard}:hover & img {
    transform: scale(1.05);
  }
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 20px;
  z-index: 10;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const GiftName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const GiftDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ItemsList = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8f8f8;
  border-radius: 8px;

  h4 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #999999;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.875rem;
    color: #666666;
    line-height: 1.5;
  }
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

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #666666;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e1e1e;
  }

  p {
    font-size: 1rem;
  }
`;

const filterOptions = [
  { value: "all", label: "모든 메뉴" },
  { value: "gift_set", label: "선물 세트" },
  { value: "songpyeon_set", label: "송편/떡국 세트" },
  { value: "baekil_dol_set", label: "백일&돌 세트" },
];

const categoryLabels: Record<string, string> = {
  gift_set: "선물 세트",
  songpyeon_set: "송편/떡국 세트",
  baekil_dol_set: "백일&돌 세트",
};

export default function GiftsPage() {
  const [activeFilter, setActiveFilter] = useState<GiftCategory>("all");

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return sampleGiftSets;
    }
    return sampleGiftSets.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  return (
    <>
      <PageHeader
        title="선물 & 세트"
        description="소중한 분께 마음을 전하는 특별한 선물 세트를 준비했습니다."
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "선물 & 세트" }]}
      />

      <Section>
        <Container>
          <MenuFilter
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter as GiftCategory)}
          />

          <GiftGrid>
            <AnimatePresence mode="wait">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <GiftCard
                    key={item.id}
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
                      <CategoryBadge>
                        {categoryLabels[item.category]}
                      </CategoryBadge>
                    </ImageWrapper>
                    <CardContent>
                      <GiftName>{item.name}</GiftName>
                      <GiftDescription>{item.description}</GiftDescription>
                      <ItemsList>
                        <h4>구성품</h4>
                        <p>{item.items.join(", ")}</p>
                      </ItemsList>
                      <PriceRow>
                        <Price>{formatPrice(item.price)}원</Price>
                        <ViewMoreButton href={`/gifts/${item.id}`}>
                          자세히 보기
                        </ViewMoreButton>
                      </PriceRow>
                    </CardContent>
                  </GiftCard>
                ))
              ) : (
                <EmptyState>
                  <h3>상품이 없습니다</h3>
                  <p>선택한 카테고리에 해당하는 상품이 없습니다.</p>
                </EmptyState>
              )}
            </AnimatePresence>
          </GiftGrid>
        </Container>
      </Section>
    </>
  );
}
