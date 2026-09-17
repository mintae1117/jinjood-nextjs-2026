import type {
  EditableProductPatch,
  GiftSet,
  MenuItem,
  ProductType,
  ReciprocateItem,
} from "@/types";

/**
 * 관리자 상품 편집 공통 유틸 (순수 함수)
 * - 서비스(adminService)와 모달(ProductEditModal)이 같은 규칙을 쓰도록 한 곳에 둔다
 * - 여기 규칙은 UX용이다. 최종 방어선은 DB(RLS + CHECK)
 */

export type EditableProduct = MenuItem | GiftSet | ReciprocateItem;
export type EditableField = keyof EditableProductPatch;
export type ProductTable = "menu_items" | "gift_sets" | "reciprocate_items";

export const PRODUCT_TABLES: Record<ProductType, ProductTable> = {
  menu_item: "menu_items",
  gift_set: "gift_sets",
  reciprocate_item: "reciprocate_items",
};

// DB CHECK (price > 0 AND price <= 1000000) 와 동일
export const PRICE_MIN = 1;
export const PRICE_MAX = 1_000_000;

export const FIELD_LABELS: Record<EditableField, string> = {
  image_url: "이미지",
  price: "가격",
  description: "설명",
  is_active: "노출",
  items: "구성품",
};

/** 상품 타입별 편집 가능 필드. items는 선물세트만. 순서 = 대조표·이력 요약 순서 */
export function editableFieldsFor(productType: ProductType): EditableField[] {
  return productType === "gift_set"
    ? ["image_url", "price", "description", "is_active", "items"]
    : ["image_url", "price", "description", "is_active"];
}

/**
 * 화이트리스트: 편집 가능 키만 골라 패치를 만든다. 그 외 키(name, image_url…)는 버린다.
 * items는 항목별 trim 후 빈 문자열 제거.
 */
export function pickEditablePatch(
  productType: ProductType,
  raw: Record<string, unknown>,
): EditableProductPatch {
  const patch: EditableProductPatch = {};

  for (const field of editableFieldsFor(productType)) {
    if (!(field in raw)) continue;
    const value = raw[field];

    switch (field) {
      case "image_url":
        if (typeof value === "string") patch.image_url = value.trim();
        break;
      case "price":
        if (typeof value === "number") patch.price = value;
        break;
      case "description":
        if (typeof value === "string") patch.description = value.trim();
        break;
      case "is_active":
        if (typeof value === "boolean") patch.is_active = value;
        break;
      case "items":
        if (Array.isArray(value)) {
          patch.items = value.map((v) => String(v).trim()).filter((v) => v.length > 0);
        }
        break;
    }
  }

  return patch;
}

/**
 * 이미지 경로 검증 — DB CHECK(admin_image.sql)와 같은 규칙: 외부 URL(`://`)·경로 탈출(`..`) 거부.
 * 접두사는 강제하지 않는다. 이력 되돌리기가 레거시 `menu/…` 경로를 다시 써야 한다.
 */
export function validateImagePath(path: unknown): string | null {
  if (typeof path !== "string" || path.length === 0) return "이미지 경로가 없습니다.";
  if (path.includes("://") || path.includes("..")) return "이미지 경로 형식이 잘못되었습니다.";
  return null;
}

/** 클라이언트 검증. 통과하면 null, 아니면 사용자에게 보여줄 에러 메시지 */
export function validatePatch(patch: EditableProductPatch): string | null {
  if ("image_url" in patch) {
    const imageError = validateImagePath(patch.image_url);
    if (imageError) return imageError;
  }
  if ("price" in patch) {
    const price = patch.price;
    if (price === undefined || !Number.isInteger(price)) {
      return "가격은 정수로 입력해주세요.";
    }
    if (price < PRICE_MIN || price > PRICE_MAX) {
      return `가격은 ${PRICE_MIN.toLocaleString("ko-KR")}원 이상 ${PRICE_MAX.toLocaleString("ko-KR")}원 이하여야 합니다.`;
    }
  }
  if ("description" in patch && (patch.description ?? "").length === 0) {
    return "설명을 입력해주세요.";
  }
  if ("items" in patch && (patch.items ?? []).length === 0) {
    return "구성품을 1개 이상 입력해주세요.";
  }
  return null;
}

export interface FieldChange {
  field: EditableField;
  label: string;
  before: unknown;
  after: unknown;
}

// null/undefined와 빈 문자열은 같은 값으로 본다(description이 NULL인 행 편집 시 가짜 변경 방지).
// 문자열은 trim해서 비교 — pickEditablePatch가 저장 시 trim하므로 비교 규칙도 맞춘다.
function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value.trim() : value;
}

function isSameValue(field: EditableField, a: unknown, b: unknown): boolean {
  // is_active는 프로젝트 전체에서 "false가 아니면 켜짐"으로 읽는다(toForm, formatFieldValue와 동일).
  // DB NULL(기본값 미설정)과 true를 다르다고 보면 안 건드린 필드가 "변경"으로 잡힌다.
  if (field === "is_active") return (a !== false) === (b !== false);
  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  }
  return normalize(a) === normalize(b);
}

/** 편집 가능 필드 중 값이 달라진 것만 반환. 확인 대조표와 이력 요약이 같이 쓴다 */
export function diffEditable(
  productType: ProductType,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): FieldChange[] {
  return editableFieldsFor(productType)
    .filter((field) => !isSameValue(field, before[field], after[field]))
    .map((field) => ({
      field,
      label: FIELD_LABELS[field],
      before: before[field],
      after: after[field],
    }));
}

/** 대조표/이력에 보여줄 값 포맷 */
export function formatFieldValue(field: EditableField, value: unknown): string {
  switch (field) {
    case "image_url": {
      if (typeof value !== "string" || value.length === 0) return "(없음)";
      return value.split("/").pop() ?? value;
    }
    case "price":
      return typeof value === "number" ? `${value.toLocaleString("ko-KR")}원` : "-";
    case "is_active":
      return value === false ? "꺼짐" : "켜짐";
    case "items":
      return Array.isArray(value) ? `${value.length}개 항목` : "-";
    case "description": {
      const text = typeof value === "string" ? value : "";
      if (text.length === 0) return "(비어 있음)";
      return text.length > 40 ? `${text.slice(0, 40)}…` : text;
    }
    default:
      return String(value ?? "");
  }
}

/** Storage 안에서 관리자가 올리는 상품 이미지의 접두사. Storage 정책(storage_policies.sql)이 이 접두사에만 쓰기를 허용한다 */
export const PRODUCT_IMAGE_PREFIX = "products";

/**
 * 업로드 경로 `products/<테이블명>/<uuid>.<ext>`. 매번 새 이름 — 같은 이름을 덮어쓰면 CDN·브라우저 캐시가
 * 옛 그림을 보여준다. 고유 이름이라 cacheControl 을 길게 줄 수 있다.
 */
export function buildProductImagePath(table: ProductTable, ext: string, id: string = crypto.randomUUID()): string {
  return `${PRODUCT_IMAGE_PREFIX}/${table}/${id}.${ext}`;
}
