"use client";

import { useState } from "react";
import styled from "styled-components";
import { AnimatePresence } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import MenuFilter from "@/components/menu/MenuFilter";
import MenuCard from "@/components/menu/MenuCard";
import { useMenuItems } from "@/hooks";
import type { MenuItem } from "@/types";
import { MenuCategory } from "@/types";

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

const MenuGrid = styled.div`
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #666666;
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #ef4444;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #666666;
  }
`;

const filterOptions = [
  { value: "all", label: "모든 메뉴" },
  { value: "chapssaltteok", label: "찹쌀떡" },
  { value: "mepssaltteok", label: "멥쌀떡" },
  { value: "tteokguk", label: "떡국" },
  { value: "others", label: "기타" },
];

interface RepresentListClientProps {
  /** 서버가 미리 조회한 전체 목록. 첫 렌더에 상품이 실리게 하는 용도 */
  initialItems: MenuItem[];
}

export default function RepresentListClient({ initialItems }: RepresentListClientProps) {
  const [activeFilter, setActiveFilter] = useState<MenuCategory>("all");
  const { items, isLoading, error, refetch } = useMenuItems(
    activeFilter === "all" ? undefined : activeFilter,
    // 필터가 "all"인 첫 렌더에서만 서버 값이 쓰인다
    activeFilter === "all" ? initialItems : undefined
  );

  return (
    <>
      <PageHeader
        title="대표 메뉴"
        description="1995년부터 이어온 전통의 맛, 정성을 담아 만든 진주떡집의 메뉴를 소개합니다."
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "대표 메뉴" }]}
      />

      <Section>
        <Container>
          <MenuFilter
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter as MenuCategory)}
          />

          {isLoading ? (
            <LoadingContainer>메뉴를 불러오는 중...</LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <h3>오류가 발생했습니다</h3>
              <p>{error.message}</p>
            </ErrorContainer>
          ) : (
            <MenuGrid>
              <AnimatePresence mode="wait">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <MenuCard key={item.id} item={item} index={index} onSaved={refetch} />
                  ))
                ) : (
                  <EmptyState>
                    <h3>메뉴가 없습니다</h3>
                    <p>선택한 카테고리에 해당하는 메뉴가 없습니다.</p>
                  </EmptyState>
                )}
              </AnimatePresence>
            </MenuGrid>
          )}
        </Container>
      </Section>
    </>
  );
}
