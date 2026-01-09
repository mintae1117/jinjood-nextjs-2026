'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/common/PageHeader';
import MenuFilter from '@/components/menu/MenuFilter';
import MenuCard from '@/components/menu/MenuCard';
import { sampleMenuItems } from '@/data/sampleData';
import { MenuCategory } from '@/types';

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

const filterOptions = [
  { value: 'all', label: '모든 메뉴' },
  { value: 'chapssaltteok', label: '찹쌀떡' },
  { value: 'mepssaltteok', label: '멥쌀떡' },
  { value: 'tteokguk', label: '떡국' },
  { value: 'others', label: '기타' },
];

export default function MenuPage() {
  const [activeFilter, setActiveFilter] = useState<MenuCategory>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return sampleMenuItems;
    }
    return sampleMenuItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <>
      <PageHeader
        title="대표 메뉴"
        description="1995년부터 이어온 전통의 맛, 정성을 담아 만든 진주떡집의 메뉴를 소개합니다."
        breadcrumbs={[
          { label: '홈', href: '/' },
          { label: '대표 메뉴' },
        ]}
      />

      <Section>
        <Container>
          <MenuFilter
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter as MenuCategory)}
          />

          <MenuGrid>
            <AnimatePresence mode="wait">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <MenuCard key={item.id} item={item} index={index} />
                ))
              ) : (
                <EmptyState>
                  <h3>메뉴가 없습니다</h3>
                  <p>선택한 카테고리에 해당하는 메뉴가 없습니다.</p>
                </EmptyState>
              )}
            </AnimatePresence>
          </MenuGrid>
        </Container>
      </Section>
    </>
  );
}
