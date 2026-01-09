"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { GiftSet } from "@/types";

const Section = styled.section`
  padding: 5rem 0;
  background-color: #f8f8f8;

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

const GiftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

const GiftCard = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
    transform: scale(1.08);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0) 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;

  ${GiftCard}:hover & {
    opacity: 1;
  }
`;

const ViewButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  color: #1e1e1e;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f35525;
    color: #ffffff;
  }
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const GiftName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const GiftDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Price = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: #f35525;
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
  color: #1e1e1e;
  background-color: transparent;
  border: 2px solid #1e1e1e;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #1e1e1e;
    color: #ffffff;
  }
`;

interface GiftSetsProps {
  giftSets: GiftSet[];
}

export default function GiftSets({ giftSets }: GiftSetsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionSubtitle>Gift Sets</SectionSubtitle>
          <SectionTitle>선물 세트</SectionTitle>
          <SectionDescription>
            소중한 분께 마음을 전하는 특별한 선물 세트를 준비했습니다.
          </SectionDescription>
        </SectionHeader>

        <GiftGrid>
          {giftSets.map((gift, index) => (
            <GiftCard
              key={gift.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={index}
            >
              <ImageWrapper>
                <Image
                  src={gift.image_url}
                  alt={gift.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <Overlay>
                  <ViewButton href={`/gifts/${gift.id}`}>
                    자세히 보기
                  </ViewButton>
                </Overlay>
              </ImageWrapper>
              <CardContent>
                <GiftName>{gift.name}</GiftName>
                <GiftDescription>{gift.description}</GiftDescription>
                <Price>{formatPrice(gift.price)}원</Price>
              </CardContent>
            </GiftCard>
          ))}
        </GiftGrid>

        <ViewAllWrapper>
          <ViewAllButton href="/gifts">
            전체 선물세트 보기
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
