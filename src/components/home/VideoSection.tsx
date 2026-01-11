"use client";

import { useRef, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FiPlay, FiPause } from "react-icons/fi";

const Section = styled.section`
  position: relative;
  padding: 5rem 0;
  background-color: #1e1e1e;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const TextContent = styled.div`
  color: #ffffff;

  @media (max-width: 1024px) {
    text-align: center;
  }
`;

const SectionSubtitle = styled(motion.span)`
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f35525;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const FeatureList = styled(motion.ul)`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 1024px) {
    align-items: center;
  }
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);

  svg {
    width: 24px;
    height: 24px;
    color: #f35525;
  }
`;

const VideoWrapper = styled(motion.div)`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);

  &::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #f35525, #ff8c42, #f35525);
    border-radius: 14px;
    z-index: -1;
    opacity: 0.7;
  }
`;

const Video = styled.video`
  width: 100%;
  display: block;
  border-radius: 12px;
`;

const PlayButton = styled.button<{ $isPlaying: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(243, 85, 37, 0.9);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: all 0.3s ease;
  opacity: ${({ $isPlaying }) => ($isPlaying ? 0 : 1)};
  pointer-events: ${({ $isPlaying }) => ($isPlaying ? "none" : "auto")};

  &:hover {
    background-color: #f35525;
    transform: translate(-50%, -50%) scale(1.1);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const StatsWrapper = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #f35525;
  line-height: 1;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
`;

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    if (isPlaying) {
      togglePlay();
    }
  };

  const currentYear = new Date().getFullYear();
  const yearsOfTradition = currentYear - 1995;

  return (
    <Section>
      <Container>
        <ContentWrapper>
          <TextContent>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              About Us
            </SectionSubtitle>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {yearsOfTradition}년 전통의 맛,
              <br />
              진주떡집입니다
            </SectionTitle>
            <Description
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              1995년 부산 남천동에서 시작한 진주떡집은 오랜 세월 동안 변함없이
              전통의 맛을 지켜오고 있습니다. 국내산 쌀과 엄선된 재료만을
              사용하여 매일 아침 신선하게 만드는 정성이 담긴 떡을 제공합니다.
            </Description>
            <FeatureList
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <FeatureItem>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                100% 국내산 쌀 사용
              </FeatureItem>
              <FeatureItem>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                매일 아침 당일 생산
              </FeatureItem>
              <FeatureItem>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                무방부제, 무첨가물
              </FeatureItem>
            </FeatureList>
          </TextContent>

          <VideoWrapper
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Video
              ref={videoRef}
              poster="/images/banners/banner001.jpeg"
              onClick={handleVideoClick}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/videos/jinjooad.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </Video>
            <PlayButton
              onClick={togglePlay}
              $isPlaying={isPlaying}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </PlayButton>
          </VideoWrapper>
        </ContentWrapper>

        <StatsWrapper
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatItem>
            <StatNumber>50+</StatNumber>
            <StatLabel>다양한 떡 종류</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>{yearsOfTradition}년</StatNumber>
            <StatLabel>전통의 역사</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>100%</StatNumber>
            <StatLabel>국내산 재료</StatLabel>
          </StatItem>
        </StatsWrapper>
      </Container>
    </Section>
  );
}
