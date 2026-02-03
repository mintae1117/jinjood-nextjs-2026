"use client";

import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

interface LoadingProps {
  /** 전체 화면 로딩 여부 */
  fullScreen?: boolean;
  /** 로딩 텍스트 */
  text?: string;
  /** 최소 높이 */
  minHeight?: string;
}

const Container = styled.div<{ $fullScreen?: boolean; $minHeight?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  min-height: ${({ $fullScreen, $minHeight }) =>
    $fullScreen ? "100vh" : $minHeight || "200px"};
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const DotsWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 12px;
  height: 12px;
  background-color: #f35525;
  border-radius: 50%;
  animation: ${bounce} 1.4s infinite ease-in-out both;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: #666666;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

/**
 * 기본 도트 로더 (원형 점 3개, 동일 크기)
 */
export function Loading({ fullScreen, text, minHeight }: LoadingProps) {
  return (
    <Container $fullScreen={fullScreen} $minHeight={minHeight}>
      <DotsWrapper>
        <Dot $delay={-0.32} />
        <Dot $delay={-0.16} />
        <Dot $delay={0} />
      </DotsWrapper>
      {text && <LoadingText>{text}</LoadingText>}
    </Container>
  );
}

/**
 * 스피너 로더
 */
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerRing = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: 3px solid #eeeeee;
  border-top-color: #f35525;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export function SpinnerLoading({ fullScreen, text, minHeight, size = 40 }: LoadingProps & { size?: number }) {
  return (
    <Container $fullScreen={fullScreen} $minHeight={minHeight}>
      <SpinnerRing $size={size} />
      {text && <LoadingText>{text}</LoadingText>}
    </Container>
  );
}

export default Loading;
