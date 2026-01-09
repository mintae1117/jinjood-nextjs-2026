'use client';

import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MenuItem } from '@/types';

const Section = styled.section`
  padding: 5rem 0;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionSubtitle = styled.span`
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f35525;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const SectionDescription = styled.p`
  font-size: 1rem;
  color: #666666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
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

const MenuCard = styled(motion.div)`
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

  ${MenuCard}:hover & img {
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

const Tag = styled.span<{ $variant?: 'popular' | 'best' | 'recommended' }>`
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
  background-color: ${({ $variant }) => {
    switch ($variant) {
      case 'popular':
        return '#ff6b6b';
      case 'best':
        return '#ffd93d';
      case 'recommended':
        return '#6bcb77';
      default:
        return '#f35525';
    }
  }};
  color: ${({ $variant }) => ($variant === 'best' ? '#1e1e1e' : '#ffffff')};
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

const ViewAllWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

const ViewAllButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d94820;
    transform: translateY(-2px);
  }
`;

interface FeaturedMenuProps {
  menuItems: MenuItem[];
}

export default function FeaturedMenu({ menuItems }: FeaturedMenuProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    }),
  };

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionSubtitle>Best Menu</SectionSubtitle>
          <SectionTitle>대표 메뉴</SectionTitle>
          <SectionDescription>
            1995년부터 이어온 전통의 맛, 정성을 담아 만든 진주떡집의 대표 메뉴를 소개합니다.
          </SectionDescription>
        </SectionHeader>

        <MenuGrid>
          {menuItems.slice(0, 9).map((item, index) => (
            <MenuCard
              key={item.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={index}
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
                <MenuName>{item.name}</MenuName>
                <MenuDescription>{item.description}</MenuDescription>
                <PriceRow>
                  <Price>{formatPrice(item.price)}원</Price>
                  <ViewMoreButton href={`/menu/${item.id}`}>자세히 보기</ViewMoreButton>
                </PriceRow>
              </CardContent>
            </MenuCard>
          ))}
        </MenuGrid>

        <ViewAllWrapper>
          <ViewAllButton href="/menu">
            전체 메뉴 보기
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4.167 10h11.666M10 4.167L15.833 10 10 15.833"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ViewAllButton>
        </ViewAllWrapper>
      </Container>
    </Section>
  );
}
