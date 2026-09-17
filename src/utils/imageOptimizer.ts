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

// ---------- 브라우저 파이프라인 (아래는 canvas·createImageBitmap 을 쓴다) ----------

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

function isOffscreen(canvas: AnyCanvas): canvas is OffscreenCanvas {
  return typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas;
}

function makeCanvas(size: Size): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(size.width, size.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
}

function drawInto(target: AnyCanvas, source: ImageBitmap | AnyCanvas, size: Size): void {
  // 유니언 타입에 바로 getContext 를 부르면 오버로드가 달라 TS 가 거부한다 — 갈라서 부른다
  const ctx = isOffscreen(target) ? target.getContext("2d") : target.getContext("2d");
  if (!ctx) throw new ImageOptimizeError("decode-failed", "이미지를 그릴 수 없습니다.");
  // 투명 영역은 흰색으로 — JPEG 폴백에서 검게 변하는 것을 막고, 상품 사진은 투명이 필요 없다
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, size.width, size.height);
}

/** 단계 축소. 절반 이하로 줄일 때 한 번에 그리면 계단 현상이 생기므로 downscaleSteps 를 따른다 */
function drawScaled(bitmap: ImageBitmap, target: Size): AnyCanvas {
  const from: Size = { width: bitmap.width, height: bitmap.height };
  const steps = downscaleSteps(from, target);
  if (steps.length === 0) {
    const canvas = makeCanvas(from);
    drawInto(canvas, bitmap, from);
    return canvas;
  }
  let source: ImageBitmap | AnyCanvas = bitmap;
  for (const step of steps) {
    const canvas = makeCanvas(step);
    drawInto(canvas, source, step);
    source = canvas;
  }
  // steps 가 비어 있지 않으므로 마지막 source 는 canvas 다
  return source as AnyCanvas;
}

function toBlob(canvas: AnyCanvas, type: string, quality: number): Promise<Blob> {
  if (isOffscreen(canvas)) return canvas.convertToBlob({ type, quality });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageOptimizeError("decode-failed", "이미지를 인코딩할 수 없습니다."))),
      type,
      quality,
    );
  });
}

/**
 * 품질 사다리를 내려가며 목표 크기 이하가 나오면 멈춘다. 끝까지 넘어도 마지막 결과를 쓴다(화질 우선).
 * WebP 인코더가 없는 브라우저(Safari 등)는 toBlob 이 PNG 를 돌려주므로 그때는 JPEG 로 같은 사다리를 탄다.
 */
async function encode(canvas: AnyCanvas, limits: ImageLimits): Promise<Blob> {
  const ladder = async (type: string): Promise<Blob | null> => {
    let last: Blob | null = null;
    for (const quality of limits.qualities) {
      const blob = await toBlob(canvas, type, quality);
      if (blob.type !== type) return null; // 인코더 없음
      last = blob;
      if (blob.size <= limits.targetBytes) return blob;
    }
    return last;
  };
  return (await ladder("image/webp")) ?? (await ladder("image/jpeg")) ?? toBlob(canvas, "image/png", 1);
}

/**
 * 파일 → 최적화된 Blob. 스펙 §5 절차.
 * 1) 타입·크기 검사 2) 디코드(EXIF 회전 반영) 3) 이미 작으면 그대로 4) 단계 축소 5) 품질 사다리 인코딩
 * 6) 결과가 원본보다 크고 원본이 상한 안이면 원본 유지
 */
export async function optimizeImage(file: File, limits: ImageLimits = IMAGE_LIMITS): Promise<OptimizedImage> {
  const inputError = checkInput(file.type, file.size, limits);
  if (inputError) throw inputError;

  let bitmap: ImageBitmap;
  try {
    // 모던 브라우저는 EXIF 방향을 여기서 반영한다(imageOrientation 기본값 from-image)
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageOptimizeError(
      "decode-failed",
      "이 브라우저에서 읽을 수 없는 이미지입니다. JPG·PNG·WebP로 저장해 다시 올려주세요.",
    );
  }

  try {
    const meta = { type: file.type, bytes: file.size, width: bitmap.width, height: bitmap.height };
    const keep = (): OptimizedImage => ({
      blob: file,
      ext: extFromMime(file.type, file.name),
      width: bitmap.width,
      height: bitmap.height,
      originalBytes: file.size,
      bytes: file.size,
      action: "kept",
    });
    if (shouldKeepOriginal(meta, limits)) return keep();

    const target = fitWithin(bitmap.width, bitmap.height, limits.maxEdge);
    const resized = target.width !== bitmap.width || target.height !== bitmap.height;
    const canvas = drawScaled(bitmap, target);
    const blob = await encode(canvas, limits);

    // 재인코딩이 오히려 커졌고 원본이 이미 상한 안(압축 포맷)이면 원본을 쓴다
    if (!resized && blob.size >= file.size && KEEPABLE_TYPES.has(file.type)) return keep();

    return {
      blob,
      ext: extFromMime(blob.type),
      width: target.width,
      height: target.height,
      originalBytes: file.size,
      bytes: blob.size,
      action: resized ? "resized+reencoded" : "reencoded",
    };
  } finally {
    bitmap.close();
  }
}
