"use client";

import { useState } from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Banner } from "@/types";

const BannerSection = styled.section`
  position: relative;
  width: 100%;
  height: 90vh;
  min-height: 600px;
  max-height: 900px;

  @media (max-width: 768px) {
    height: 70vh;
    min-height: 500px;
  }
`;

const SlideWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const SlideBackground = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${({ $imageUrl }) => $imageUrl});
  background-size: cover;
  background-position: center;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.2) 100%
    );
  }
`;

const SlideContent = styled.div`
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  color: #ffffff;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    text-align: center;
    align-items: center;
  }
`;

const Subtitle = styled(motion.span)`
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #f35525;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  max-width: 600px;

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.875rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.125rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  max-width: 500px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;

  .swiper-pagination {
    bottom: 30px;
  }

  .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background-color: rgba(255, 255, 255, 0.5);
    opacity: 1;

    &.swiper-pagination-bullet-active {
      background-color: #f35525;
    }
  }

  .swiper-button-prev,
  .swiper-button-next {
    color: #ffffff;
    width: 50px;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    padding: 15px;

    &:hover {
      background-color: #f35525;
    }

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;

  span {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ScrollLine = styled(motion.div)`
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background-color: #f35525;
    animation: scrollDown 1.5s ease-in-out infinite;
  }

  @keyframes scrollDown {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(200%);
    }
  }
`;

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <BannerSection>
      <StyledSwiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <SlideWrapper>
              <SlideBackground $imageUrl={banner.image_url} />
              <SlideContent>
                <Subtitle
                  variants={textVariants}
                  initial="hidden"
                  animate={activeIndex === index ? "visible" : "hidden"}
                  custom={0}
                >
                  {banner.subtitle}
                </Subtitle>
                <Title
                  variants={textVariants}
                  initial="hidden"
                  animate={activeIndex === index ? "visible" : "hidden"}
                  custom={1}
                >
                  {banner.title}
                </Title>
                <Description
                  variants={textVariants}
                  initial="hidden"
                  animate={activeIndex === index ? "visible" : "hidden"}
                  custom={2}
                >
                  {banner.description}
                </Description>
              </SlideContent>
            </SlideWrapper>
          </SwiperSlide>
        ))}
      </StyledSwiper>
      <ScrollIndicator
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span>Scroll</span>
        <ScrollLine />
      </ScrollIndicator>
    </BannerSection>
  );
}
