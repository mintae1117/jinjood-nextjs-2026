"use client";

import { useRef, type ChangeEvent } from "react";
import styled from "styled-components";
import { FiImage, FiX } from "react-icons/fi";
import { getStorageUrl } from "@/lib/supabase";
import { IMAGE_LIMITS, describeResult, formatBytes, type OptimizedImage } from "@/utils/imageOptimizer";

/**
 * 상품 이미지 항목: 현재 이미지(또는 고른 새 이미지) 미리보기 + 파일 선택 + 최적화 결과 한 줄.
 * 업로드는 하지 않는다 — 파일을 고르면 부모(모달)가 optimizeImage 를 돌려 pending 으로 내려준다.
 * 모달과 분리한 이유: 후속 "상품 추가" 모달이 그대로 재사용한다.
 */

export interface PendingImage {
  optimized: OptimizedImage;
  /** URL.createObjectURL(optimized.blob). 정리는 부모가 한다 */
  previewUrl: string;
}

interface ProductImageFieldProps {
  currentPath: string | null | undefined;
  pending: PendingImage | null;
  isOptimizing: boolean;
  disabled?: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  > span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e1e1e;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Preview = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 160px;
  height: 160px;
  overflow: hidden;
  background-color: #f8f8f8;
  border: 1px solid #eeeeee;
  border-radius: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const NewBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 10px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1e1e1e;
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: #f35525;
    color: #f35525;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Info = styled.small<{ $accent?: boolean }>`
  font-size: 0.75rem;
  line-height: 1.5;
  color: ${({ $accent }) => ($accent ? "#f35525" : "#999999")};
  word-break: keep-all;
`;

export default function ProductImageField({
  currentPath,
  pending,
  isOptimizing,
  disabled = false,
  onPick,
  onClear,
}: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 같은 파일을 다시 골라도 change 가 나도록 값을 비운다
    e.target.value = "";
    if (file) onPick(file);
  };

  const src = pending ? pending.previewUrl : getStorageUrl(currentPath);
  const busy = disabled || isOptimizing;

  return (
    <Wrapper>
      <span>이미지</span>
      <Row>
        <Preview>
          {/* blob: URL 미리보기라 next/image 를 쓰지 않는다(관리자 전용, 표시 1장) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={pending ? "새 이미지 미리보기" : "현재 이미지"} />
          {pending && <NewBadge>새 이미지</NewBadge>}
        </Preview>
        <Controls>
          <Buttons>
            <SmallButton type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
              <FiImage size={14} />
              {pending ? "다른 이미지 선택" : "이미지 변경"}
            </SmallButton>
            {pending && (
              <SmallButton type="button" onClick={onClear} disabled={busy} aria-label="선택 취소">
                <FiX size={14} />
                선택 취소
              </SmallButton>
            )}
          </Buttons>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleChange}
            aria-label="상품 이미지 파일 선택"
          />
          {isOptimizing ? (
            <Info $accent>이미지 최적화 중…</Info>
          ) : pending ? (
            <Info $accent>{describeResult(pending.optimized)}</Info>
          ) : (
            <Info>
              JPG·PNG·WebP, {formatBytes(IMAGE_LIMITS.maxInputBytes)} 이하. 올리기 전에 긴 변 {IMAGE_LIMITS.maxEdge}px·
              {formatBytes(IMAGE_LIMITS.targetBytes)} 안팎으로 자동 최적화됩니다.
            </Info>
          )}
        </Controls>
      </Row>
    </Wrapper>
  );
}
