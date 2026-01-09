"use client";

import { useState, useMemo } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import MenuFilter from "@/components/menu/MenuFilter";
import { sampleReciprocateItems } from "@/data/sampleData";
import { ReciprocateCategory } from "@/types";

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

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #f35525 0%, #ff8c42 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  color: #ffffff;
  text-align: center;

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }
`;

const ReciprocateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ReciprocateCard = styled(motion.div)`
  display: flex;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 40%;
  min-height: 250px;
  overflow: hidden;

  img {
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${ReciprocateCard}:hover & img {
    transform: scale(1.05);
  }

  @media (max-width: 640px) {
    width: 100%;
    aspect-ratio: 16/9;
    min-height: auto;
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
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ContentTop = styled.div``;

const ReciprocateName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ReciprocateDescription = styled.p`
  font-size: 1rem;
  color: #666666;
  line-height: 1.7;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const ContentBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eeeeee;
`;

const Price = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f35525;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const InquiryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d94820;
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
  { value: "ibaji", label: "이바지" },
  { value: "daprye", label: "답례" },
];

const categoryLabels: Record<string, string> = {
  ibaji: "이바지",
  daprye: "답례",
};

export default function ReciprocatePage() {
  const [activeFilter, setActiveFilter] = useState<ReciprocateCategory>("all");

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return sampleReciprocateItems;
    }
    return sampleReciprocateItems.filter(
      (item) => item.category === activeFilter
    );
  }, [activeFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  return (
    <>
      <PageHeader
        title="이바지 & 답례"
        description="특별한 날을 더욱 의미있게 만드는 전통 이바지떡과 답례떡을 준비했습니다."
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "이바지 & 답례" }]}
      />

      <Section>
        <Container>
          <InfoBanner>
            <h3>맞춤 주문 안내</h3>
            <p>
              이바지떡과 답례떡은 행사 규모와 예산에 맞춰 맞춤 구성이
              가능합니다. 자세한 상담은 전화(051-621-5108)로 문의해 주세요.
            </p>
          </InfoBanner>

          <MenuFilter
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={(filter) =>
              setActiveFilter(filter as ReciprocateCategory)
            }
          />

          <ReciprocateGrid>
            <AnimatePresence mode="wait">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <ReciprocateCard
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
                        sizes="(max-width: 640px) 100vw, 40vw"
                      />
                      <CategoryBadge>
                        {categoryLabels[item.category]}
                      </CategoryBadge>
                    </ImageWrapper>
                    <CardContent>
                      <ContentTop>
                        <ReciprocateName>{item.name}</ReciprocateName>
                        <ReciprocateDescription>
                          {item.description}
                        </ReciprocateDescription>
                      </ContentTop>
                      <ContentBottom>
                        <Price>{formatPrice(item.price)}원~</Price>
                        <InquiryButton href="/contact">문의하기</InquiryButton>
                      </ContentBottom>
                    </CardContent>
                  </ReciprocateCard>
                ))
              ) : (
                <EmptyState>
                  <h3>상품이 없습니다</h3>
                  <p>선택한 카테고리에 해당하는 상품이 없습니다.</p>
                </EmptyState>
              )}
            </AnimatePresence>
          </ReciprocateGrid>
        </Container>
      </Section>
    </>
  );
}
