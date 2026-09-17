/**
 * 관리자 상품 이미지 업로드 전 브라우저 최적화 — 규칙의 단일 출처.
 *
 * 왜 브라우저에서: 서버 계층이 없는 구조(브라우저 → Supabase)를 유지하고, Supabase 무료 플랜의
 * Storage 1GB·egress 월 ~5GB 를 지키려면 올라가기 전에 줄여야 한다.
 * 왜 이 값: 카드 ~400px·상세 ~800px 의 레티나 2배가 1600px. WebP 0.85 는 사진에서 육안 손실이 거의 없는 구간.
 * 목표(300KB)를 넘어도 0.72 아래로는 내려가지 않는다 — 용량보다 화질을 지킨다.
 *
 * 이 파일의 순수 함수는 `node:test` 로 검증한다(브라우저 API 를 import 시점에 건드리지 않는다).
 */

export interface ImageLimits {
  /** 이보다 큰 원본은 받지 않는다 */
  maxInputBytes: number;
  /** 긴 변 상한(px) */
  maxEdge: number;
  /** 이 아래면 만족 */
  targetBytes: number;
  /** 목표를 넘을 때만 다음 단계. 마지막 값 아래로는 내려가지 않는다 */
  qualities: readonly number[];
}

export const IMAGE_LIMITS: ImageLimits = {
  maxInputBytes: 20 * 1024 * 1024,
  maxEdge: 1600,
  targetBytes: 300 * 1024,
  qualities: [0.85, 0.78, 0.72],
};

export type OptimizeAction = "kept" | "resized" | "reencoded" | "resized+reencoded";

export interface OptimizedImage {
  /** 올릴 파일. action 이 kept 면 원본 File 그대로 */
  blob: Blob;
  /** blob.type 에서 도출한 확장자(webp·jpg·…). kept 면 원본 확장자 */
  ext: string;
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
  action: OptimizeAction;
}

export type ImageOptimizeErrorCode = "not-image" | "too-large" | "decode-failed";

export class ImageOptimizeError extends Error {
  readonly code: ImageOptimizeErrorCode;
  constructor(code: ImageOptimizeErrorCode, message: string) {
    super(message);
    this.name = "ImageOptimizeError";
    this.code = code;
  }
}

export interface Size {
  width: number;
  height: number;
}

/** 그대로 올려도 되는 입력 타입 — 브라우저·next/image 가 그대로 표시하고 이미 압축 포맷이다 */
const KEEPABLE_TYPES = new Set(["image/webp", "image/jpeg", "image/avif"]);

const EXT_BY_MIME: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** 파일을 읽기 전 1차 검사. 통과하면 null */
export function checkInput(type: string, bytes: number, limits: ImageLimits = IMAGE_LIMITS): ImageOptimizeError | null {
  if (!type.startsWith("image/")) {
    return new ImageOptimizeError("not-image", "이미지 파일만 올릴 수 있습니다.");
  }
  if (bytes > limits.maxInputBytes) {
    return new ImageOptimizeError("too-large", `${formatBytes(limits.maxInputBytes)} 이하 이미지만 올릴 수 있습니다.`);
  }
  return null;
}

/** 긴 변이 maxEdge 를 넘지 않게 맞춘 크기. 넘지 않으면 그대로(확대하지 않는다) */
export function fitWithin(width: number, height: number, maxEdge: number): Size {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * 축소 단계. 한 번에 절반 이하로 줄이면 계단 현상이 생기므로 절반씩 줄이다가 마지막에 목표 크기로.
 * from 과 to 가 같으면 빈 배열.
 */
export function downscaleSteps(from: Size, to: Size): Size[] {
  const steps: Size[] = [];
  let { width, height } = from;
  while (Math.max(width, height) / 2 > Math.max(to.width, to.height)) {
    width = Math.round(width / 2);
    height = Math.round(height / 2);
    steps.push({ width, height });
  }
  if (width !== to.width || height !== to.height) steps.push({ ...to });
  return steps;
}

/** 재인코딩 없이 그대로 올릴 수 있는가: 압축 포맷이고 크기·해상도가 모두 상한 안 */
export function shouldKeepOriginal(
  meta: { type: string; bytes: number; width: number; height: number },
  limits: ImageLimits = IMAGE_LIMITS,
): boolean {
  return (
    KEEPABLE_TYPES.has(meta.type) &&
    Math.max(meta.width, meta.height) <= limits.maxEdge &&
    meta.bytes <= limits.targetBytes
  );
}

/** MIME → 확장자. 모르는 MIME 이면 파일명의 확장자(소문자), 그것도 없으면 bin */
export function extFromMime(type: string, fallbackName?: string): string {
  const known = EXT_BY_MIME[type];
  if (known) return known;
  const fromName = fallbackName?.split(".").pop()?.toLowerCase();
  return fromName && fromName !== fallbackName?.toLowerCase() ? fromName : "bin";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  // 20.0MB 가 아니라 20MB 로
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")}MB`;
}

function formatLabel(type: string): string {
  if (type === "image/webp") return "WebP";
  if (type === "image/jpeg") return "JPEG";
  if (type === "image/png") return "PNG";
  if (type === "image/avif") return "AVIF";
  return type.replace("image/", "").toUpperCase();
}

/** 모달에 보여줄 결과 한 줄 */
export function describeResult(result: OptimizedImage): string {
  const size = `${result.width}×${result.height}`;
  if (result.action === "kept") {
    return `이미 작아서 그대로 올립니다 (${formatBytes(result.bytes)} · ${size})`;
  }
  return `${formatBytes(result.originalBytes)} → ${formatBytes(result.bytes)} · ${size} · ${formatLabel(result.blob.type)}`;
}
