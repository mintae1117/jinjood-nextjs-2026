"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { FiX, FiPlus, FiTrash2, FiRotateCcw, FiChevronDown, FiChevronUp } from "react-icons/fi";
import type { EditableProductPatch, ProductRevision, ProductType } from "@/types";
import { adminService, storageService } from "@/services";
import { getStorageUrl } from "@/lib/supabase";
import {
  type EditableProduct,
  type FieldChange,
  PRODUCT_TABLES,
  diffEditable,
  formatFieldValue,
  pickEditablePatch,
  validatePatch,
  PRICE_MAX,
  PRICE_MIN,
} from "@/utils/adminProduct";
import { describeResult, optimizeImage } from "@/utils/imageOptimizer";
import ProductImageField, { type PendingImage } from "./ProductImageField";

/**
 * 관리자 상품 편집 모달
 * 2단계: 편집 → 확인(전/후 대조표) → adminService.updateProduct
 * 하단 "최근 수정 이력"에서 이전 값으로 되돌리기(같은 확인 단계를 탄다)
 * body 직속으로 포털 렌더 — 카드의 transform/overflow 영향을 받지 않게
 */

interface ProductEditModalProps {
  productType: ProductType;
  product: EditableProduct;
  onClose: () => void;
  onSaved: () => void;
}

type Step = "edit" | "confirm";

// 입력 폼 상태. price는 input 편의상 문자열
type FormState = {
  image_url: string;
  price: string;
  description: string;
  is_active: boolean;
  items: string[];
};

// 상품 행(또는 이력의 before) → 폼
function toForm(source: Record<string, unknown>): FormState {
  return {
    image_url: typeof source.image_url === "string" ? source.image_url : "",
    price: source.price == null ? "" : String(source.price),
    description: typeof source.description === "string" ? source.description : "",
    is_active: source.is_active !== false,
    items: Array.isArray(source.items) ? source.items.map(String) : [],
  };
}

// 폼 → 패치 원료 (pickEditablePatch가 타입별로 걸러낸다)
function fromForm(form: FormState): Record<string, unknown> {
  return {
    image_url: form.image_url,
    price: form.price.trim() === "" ? NaN : Number(form.price),
    description: form.description,
    is_active: form.is_active,
    items: form.items,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

// ---------- styles ----------

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  @media (max-width: 640px) {
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #eeeeee;
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e1e1e;

  span {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #999999;
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: #666666;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #f8f8f8;
    color: #1e1e1e;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Body = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  > span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e1e1e;
  }

  small {
    font-size: 0.75rem;
    color: #999999;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #1e1e1e;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  outline: none;

  &:focus {
    border-color: #f35525;
  }
`;

const Textarea = styled.textarea`
  min-height: 120px;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #1e1e1e;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  resize: vertical;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #f35525;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;

  > span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e1e1e;
  }
`;

const Toggle = styled.button<{ $on: boolean }>`
  position: relative;
  width: 48px;
  height: 28px;
  border: none;
  border-radius: 14px;
  background-color: ${({ $on }) => ($on ? "#22c55e" : "#cccccc")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ $on }) => ($on ? "23px" : "3px")};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: left 0.2s ease;
  }
`;

const ItemsEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemRow = styled.div`
  display: flex;
  gap: 0.5rem;

  ${Input} {
    flex: 1;
  }
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

// 되돌리기 전용: 아이콘만. 요약 텍스트가 길어도 찌그러지지 않게 flex-shrink를 끈다
const RevertButton = styled(SmallButton)`
  flex-shrink: 0;
  padding: 0.5rem;
`;

const ErrorText = styled.p`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e1e1e;
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #f8f8f8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #d94820;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DiffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;

  th,
  td {
    padding: 0.75rem 0.5rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid #eeeeee;
    word-break: keep-all;
  }

  th {
    width: 4.5rem;
    font-weight: 600;
    color: #666666;
  }

  td.before {
    color: #999999;
    text-decoration: line-through;
  }

  td.arrow {
    width: 1.5rem;
    color: #999999;
    text-align: center;
  }

  td.after {
    font-weight: 600;
    color: #f35525;
  }
`;

// 대조표의 이미지 행: 경로 문자열 대신 썸네일로 보여준다
const Thumb = styled.img`
  display: block;
  width: 72px;
  height: 72px;
  margin-bottom: 0.25rem;
  object-fit: cover;
  border: 1px solid #eeeeee;
  border-radius: 6px;
`;

const ItemsDiff = styled.ul`
  margin-top: 0.375rem;
  padding-left: 1rem;
  font-size: 0.8125rem;
  color: #666666;
  text-decoration: none;

  li {
    list-style: disc;
  }
`;

const DiffNote = styled.p`
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #666666;
  line-height: 1.5;
  white-space: pre-line;
`;

const Section = styled.section`
  border-top: 1px solid #eeeeee;
  padding-top: 1rem;
`;

const SectionToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e1e1e;
  background: none;
  border: none;
  cursor: pointer;
`;

const RevisionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const RevisionItem = styled.li`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  font-size: 0.8125rem;
  background-color: #f8f8f8;
  border-radius: 8px;

  time {
    display: block;
    margin-bottom: 0.25rem;
    color: #999999;
  }

  p {
    color: #1e1e1e;
    line-height: 1.5;
  }
`;

// ---------- component ----------

export default function ProductEditModal({
  productType,
  product,
  onClose,
  onSaved,
}: ProductEditModalProps) {
  const productRecord = product as unknown as Record<string, unknown>;
  const isGiftSet = productType === "gift_set";

  const [step, setStep] = useState<Step>("edit");
  const [form, setForm] = useState<FormState>(() => toForm(productRecord));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [pendingPatch, setPendingPatch] = useState<EditableProductPatch | null>(null);
  const [changes, setChanges] = useState<FieldChange[]>([]);

  const [revisions, setRevisions] = useState<ProductRevision[]>([]);
  const [revisionsOpen, setRevisionsOpen] = useState(false);

  // 고른 새 이미지(최적화 결과). 업로드는 확인 단계의 저장 시점에만 — 편집 단계에서 올리면 취소한 파일이 고아로 남는다
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // object URL 정리 — 새 파일로 바뀌거나 모달이 닫힐 때
  useEffect(() => {
    if (!pendingImage) return;
    const url = pendingImage.previewUrl;
    return () => URL.revokeObjectURL(url);
  }, [pendingImage]);

  const handlePickImage = async (file: File) => {
    setError(null);
    setIsOptimizing(true);
    try {
      const optimized = await optimizeImage(file);
      setPendingImage({ optimized, previewUrl: URL.createObjectURL(optimized.blob) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지를 처리하지 못했습니다.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearImage = () => {
    setPendingImage(null);
    setError(null);
  };

  // 최근 수정 이력 로드 (실패해도 모달은 동작해야 하므로 조용히 빈 배열)
  useEffect(() => {
    adminService
      .getRevisions(productType, product.id, 10)
      .then(setRevisions)
      .catch(() => setRevisions([]));
  }, [productType, product.id]);

  // ESC로 닫기 (저장 중에는 잠금) + 배경 스크롤 잠금
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isSaving, onClose]);

  // 편집 → 확인 단계. 검증하고 바뀐 필드만 골라 대조표를 만든다.
  // hasPendingImage: 새 이미지는 아직 경로가 없어 patch 에 없다 — 그것만으로도 변경이다
  const prepareConfirm = useCallback(
    (nextForm: FormState, hasPendingImage: boolean = pendingImage !== null) => {
      setError(null);

      const patch = pickEditablePatch(productType, fromForm(nextForm));

      // 바뀐 필드만 골라낸다 — 검증도 바뀐 필드에만 건다.
      // (전체 패치를 검증하면 구성품이 비어 있는 선물세트는 가격만 고쳐도 "구성품 1개 이상"에 막힌다)
      const fieldChanges = diffEditable(productType, productRecord, { ...productRecord, ...patch });
      if (fieldChanges.length === 0 && !hasPendingImage) {
        setError("변경된 내용이 없습니다.");
        return;
      }

      const changedPatch: EditableProductPatch = {};
      for (const change of fieldChanges) {
        (changedPatch as Record<string, unknown>)[change.field] = patch[change.field];
      }

      const validationError = validatePatch(changedPatch);
      if (validationError) {
        setError(validationError);
        return;
      }

      setPendingPatch(changedPatch);
      setChanges(fieldChanges);
      setStep("confirm");
    },
    [productType, productRecord, pendingImage],
  );

  const handleConfirm = async () => {
    if (!pendingPatch && !pendingImage) return;
    setIsSaving(true);
    setError(null);
    let uploadedPath: string | null = null;
    try {
      const patch: EditableProductPatch = { ...(pendingPatch ?? {}) };
      if (pendingImage) {
        uploadedPath = await storageService.uploadProductImage(
          PRODUCT_TABLES[productType],
          pendingImage.optimized.blob,
          pendingImage.optimized.ext,
        );
        patch.image_url = uploadedPath;
      }
      await adminService.updateProduct(productType, product.id, patch);
      onSaved();
      onClose();
    } catch (err) {
      // 업로드는 됐는데 UPDATE 가 실패하면 방금 올린 파일을 회수한다(best-effort)
      if (uploadedPath) void storageService.removeProductImage(uploadedPath);
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 이력의 before 값을 폼에 얹고 바로 확인 단계로 (되돌리기도 updateProduct를 그대로 탄다).
  // 고른 새 이미지는 버린다 — 되돌리기는 "그 시점 값으로 완전히 돌아가기"다. 이전 파일은 지우지 않았으므로
  // 옛 경로가 살아 있다. setPendingImage(null) 은 다음 렌더에 반영되므로 hasPendingImage=false 를 직접 넘긴다.
  const handleRevert = (revision: ProductRevision) => {
    setPendingImage(null);
    const restored = toForm({ ...productRecord, ...revision.before });
    setForm(restored);
    prepareConfirm(restored, false);
  };

  const updateItem = (index: number, value: string) => {
    setForm((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === index ? value : it)) }));
  };
  const removeItem = (index: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };
  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, ""] }));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <Overlay
      onClick={() => {
        if (!isSaving) onClose();
      }}
      role="presentation"
    >
      <Sheet role="dialog" aria-modal="true" aria-labelledby="product-edit-title" onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title id="product-edit-title">
            {step === "edit" ? "상품 수정" : "변경 내용 확인"}
            <span>{product.name}</span>
          </Title>
          <IconButton onClick={onClose} disabled={isSaving} aria-label="닫기">
            <FiX size={20} />
          </IconButton>
        </Header>

        {step === "edit" ? (
          <>
            <Body>
              <ProductImageField
                currentPath={form.image_url || product.image_url}
                pending={pendingImage}
                isOptimizing={isOptimizing}
                disabled={isSaving}
                onPick={handlePickImage}
                onClear={handleClearImage}
              />

              <Field>
                <span>가격 (원)</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={100}
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
                <small>
                  {form.price.trim() !== "" && !Number.isNaN(Number(form.price))
                    ? `${Number(form.price).toLocaleString("ko-KR")}원`
                    : "숫자만 입력"}
                </small>
              </Field>

              <Field>
                <span>설명</span>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <small>개입 수량은 이 문장 안에서 고칩니다. 예: (1되/40개입), (16개입)</small>
              </Field>

              {isGiftSet && (
                <Field>
                  <span>구성품</span>
                  <ItemsEditor>
                    {form.items.map((item, index) => (
                      <ItemRow key={index}>
                        <Input
                          type="text"
                          value={item}
                          placeholder="예: 오색손송편 1kg"
                          onChange={(e) => updateItem(index, e.target.value)}
                        />
                        <IconButton type="button" onClick={() => removeItem(index)} aria-label="구성품 삭제">
                          <FiTrash2 size={16} />
                        </IconButton>
                      </ItemRow>
                    ))}
                    <SmallButton type="button" onClick={addItem}>
                      <FiPlus size={14} />
                      항목 추가
                    </SmallButton>
                  </ItemsEditor>
                </Field>
              )}

              <ToggleRow>
                <span>사이트에 노출</span>
                <Toggle
                  type="button"
                  $on={form.is_active}
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  aria-pressed={form.is_active}
                  aria-label="노출 여부"
                />
              </ToggleRow>

              {error && <ErrorText>{error}</ErrorText>}

              {revisions.length > 0 && (
                <Section>
                  <SectionToggle type="button" onClick={() => setRevisionsOpen((v) => !v)}>
                    최근 수정 이력 ({revisions.length})
                    {revisionsOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </SectionToggle>
                  {revisionsOpen && (
                    <RevisionList>
                      {revisions.map((revision) => {
                        const summary = diffEditable(productType, revision.before, revision.after)
                          .map((c) => `${c.label} ${formatFieldValue(c.field, c.before)} → ${formatFieldValue(c.field, c.after)}`)
                          .join(" · ");
                        return (
                          <RevisionItem key={revision.id}>
                            <div>
                              <time dateTime={revision.changed_at}>
                                {formatDate(revision.changed_at)}
                                {revision.changed_by === null && " (콘솔 수정)"}
                              </time>
                              <p>{summary || "(편집 항목 외 변경)"}</p>
                            </div>
                            <RevertButton
                              type="button"
                              onClick={() => handleRevert(revision)}
                              aria-label="이 값으로 되돌리기"
                              title="이 값으로 되돌리기"
                            >
                              <FiRotateCcw size={16} />
                            </RevertButton>
                          </RevisionItem>
                        );
                      })}
                    </RevisionList>
                  )}
                </Section>
              )}
            </Body>

            <Footer>
              <SecondaryButton type="button" onClick={onClose}>
                취소
              </SecondaryButton>
              <PrimaryButton type="button" onClick={() => prepareConfirm(form)} disabled={isOptimizing}>
                저장
              </PrimaryButton>
            </Footer>
          </>
        ) : (
          <>
            <Body>
              <DiffTable>
                <tbody>
                  {pendingImage && (
                    <tr key="pending-image">
                      <th>이미지</th>
                      <td className="before">
                        <Thumb src={getStorageUrl(product.image_url)} alt="현재 이미지" />
                        {formatFieldValue("image_url", product.image_url)}
                      </td>
                      <td className="arrow">→</td>
                      <td className="after">
                        <Thumb src={pendingImage.previewUrl} alt="새 이미지" />
                        새 이미지
                        <DiffNote>{describeResult(pendingImage.optimized)}</DiffNote>
                      </td>
                    </tr>
                  )}
                  {changes.map((change) => (
                    <tr key={change.field}>
                      <th>{change.label}</th>
                      <td className="before">
                        {change.field === "image_url" && typeof change.before === "string" && change.before !== "" && (
                          <Thumb src={getStorageUrl(change.before)} alt="이전 이미지" />
                        )}
                        {formatFieldValue(change.field, change.before)}
                        {change.field === "items" && Array.isArray(change.before) && (
                          <ItemsDiff>
                            {(change.before as string[]).map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ItemsDiff>
                        )}
                      </td>
                      <td className="arrow">→</td>
                      <td className="after">
                        {change.field === "image_url" && typeof change.after === "string" && change.after !== "" && (
                          <Thumb src={getStorageUrl(change.after)} alt="되돌릴 이미지" />
                        )}
                        {formatFieldValue(change.field, change.after)}
                        {change.field === "items" && Array.isArray(change.after) && (
                          <ItemsDiff>
                            {(change.after as string[]).map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ItemsDiff>
                        )}
                        {change.field === "description" && typeof change.after === "string" && (
                          <DiffNote>{change.after}</DiffNote>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DiffTable>

              {error && <ErrorText>{error}</ErrorText>}
            </Body>

            <Footer>
              <SecondaryButton type="button" onClick={() => setStep("edit")} disabled={isSaving}>
                돌아가기
              </SecondaryButton>
              <PrimaryButton type="button" onClick={handleConfirm} disabled={isSaving}>
                {isSaving ? "수정 중..." : "확인하고 수정"}
              </PrimaryButton>
            </Footer>
          </>
        )}
      </Sheet>
    </Overlay>,
    document.body,
  );
}
