# 관리자 상품 이미지 교체 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자가 상품 수정 모달에서 새 이미지를 골라 브라우저에서 최적화(긴 변 1600px·WebP·300KB 목표)한 뒤 Supabase Storage `products/`에 올리고 `image_url`을 교체한다. 동시에 로그인 사용자 전체에게 버킷 쓰기를 허용하던 Storage 정책을 아바타 본인·상품 관리자로 좁힌다.

**Architecture:** 서버 계층 없음. 브라우저가 canvas로 리사이즈·재인코딩 → `supabase.storage` 직접 업로드 → 기존 `adminService.updateProduct`로 `image_url` UPDATE. 보안 경계는 RLS(`is_admin()`) + 컬럼 GRANT + CHECK + Storage 정책. 업로드는 확인 단계 저장 시점에만 하고, UPDATE 실패 시 방금 올린 파일을 회수한다. 이전 파일은 보존해 이력 되돌리기가 이미지에도 동작한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, styled-components 6, Supabase (`@supabase/supabase-js` storage API), Postgres RLS. 테스트: Node 22 내장 `node:test` + `--experimental-strip-types`(의존성 추가 없음).

**Spec:** `docs/superpowers/specs/2026-09-17-admin-product-image-design.md`

## Global Constraints

- 모든 코드 주석·사용자 문구는 한국어. TypeScript strict. styled-components props는 `$` 접두사.
- 브라우저 → Supabase 직접 호출 구조 유지. Server Action·Service Role·API Route 추가 금지.
- 최적화 상수(스펙 §5): 입력 상한 `20 * 1024 * 1024`, 긴 변 `1600`, 목표 `300 * 1024`, 품질 사다리 `[0.85, 0.78, 0.72]`. 그 아래 품질로 내려가지 않는다.
- 업로드 경로: `products/<테이블명>/<uuid>.<ext>`. 버킷 `images`. `cacheControl: "31536000"`, `upsert: false`. 이전 파일은 지우지 않는다.
- `image_url` 규칙(클라이언트·DB 동일): `://`와 `..`를 포함하면 거부. 접두사는 강제하지 않는다(되돌리기가 레거시 `menu/…`를 다시 쓴다).
- 상품 테이블 INSERT/DELETE 정책은 열지 않는다. 기존 `admin_edit.sql`은 주석 한 줄 외에 고치지 않는다(이미 실행된 마이그레이션).
- 커밋 메시지: `<type>(<scope>): <subject>` (type: feat|fix|docs|chore|refactor, scope: product|ui|auth …). 끝에 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- 작업 브랜치: `feature/admin-product-image` (이미 존재, 스펙 커밋 1개). main에 직접 커밋하지 않는다.
- 게이트: `npm run lint`, `npm run build`, `npm test`(Task 1에서 추가). 각 태스크 커밋 전에 해당 게이트를 돌린다.

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/utils/imageOptimizer.ts` (신규) | 최적화 규칙의 단일 출처. 순수 함수(입력 검사·크기 계산·단계 축소·유지 판정·확장자·문구)와 브라우저 파이프라인 `optimizeImage(file)` |
| `src/utils/imageOptimizer.test.ts` (신규) | 순수 함수 단위 테스트 (`node:test`) |
| `src/utils/adminProduct.ts` (수정) | 화이트리스트에 `image_url` 추가, 경로 검증, 라벨·포맷, `buildProductImagePath` |
| `src/utils/adminProduct.test.ts` (신규) | 화이트리스트·검증·경로 단위 테스트 |
| `src/types/index.ts` (수정) | `EditableProductPatch.image_url` |
| `src/services/storage.ts` (신규) | `storageService.uploadProductImage` / `removeProductImage` — 모달과 분리(후속 추가·삭제가 재사용) |
| `src/services/admin.ts` (수정) | CHECK 위반(23514) 메시지를 제약 이름으로 가름 |
| `src/services/index.ts` (수정) | `storageService` export |
| `src/components/admin/ProductImageField.tsx` (신규) | 현재/새 이미지 미리보기 + 파일 선택 + 결과 문구. 생성 모달(후속)이 재사용 |
| `src/components/admin/ProductEditModal.tsx` (수정) | 이미지 항목 배치, 대조표 썸네일, 저장 시 업로드 → UPDATE → 실패 시 회수 |
| `supabase/storage_policies.sql` (신규) | 기존 FOR ALL 정책 DROP, 아바타 본인·상품 관리자 정책 |
| `supabase/storage_policies_verify.sql` (신규) | BEGIN…ROLLBACK 정책 검증 |
| `supabase/admin_image.sql` (신규) | `GRANT UPDATE (image_url)` 3테이블 + CHECK + 사전 확인 쿼리 + 롤백 블록 |
| `supabase/admin_edit.sql` (수정) | §3b에 "image_url 은 admin_image.sql" 주석 한 줄 |
| `package.json`, `tsconfig.json` (수정) | `test` 스크립트, `allowImportingTsExtensions` |
| `README.md`, `CLAUDE.md` (수정) | 운영 절차·규칙 반영 |

---

### Task 1: 테스트 러너 셋업 + 이미지 최적화 순수 로직

**Files:**
- Modify: `package.json` (scripts), `tsconfig.json` (compilerOptions)
- Create: `src/utils/imageOptimizer.ts` (순수 함수 부분만)
- Test: `src/utils/imageOptimizer.test.ts`

**Interfaces:**
- Produces (Task 2·7·8이 쓴다):
  - `IMAGE_LIMITS: { maxInputBytes: number; maxEdge: number; targetBytes: number; qualities: readonly number[] }`
  - `type ImageLimits`, `type OptimizeAction = "kept" | "resized" | "reencoded" | "resized+reencoded"`
  - `interface OptimizedImage { blob: Blob; ext: string; width: number; height: number; originalBytes: number; bytes: number; action: OptimizeAction }`
  - `class ImageOptimizeError extends Error { readonly code: "not-image" | "too-large" | "decode-failed" }`
  - `checkInput(type: string, bytes: number, limits?): ImageOptimizeError | null`
  - `fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number }`
  - `downscaleSteps(from: Size, to: Size): Size[]` (`type Size = { width: number; height: number }`)
  - `shouldKeepOriginal(meta: { type: string; bytes: number; width: number; height: number }, limits?): boolean`
  - `extFromMime(type: string, fallbackName?: string): string`
  - `formatBytes(bytes: number): string`, `describeResult(result: OptimizedImage): string`

- [ ] **Step 1: 테스트 스크립트와 tsconfig 옵션 추가**

`package.json`의 `scripts`에 한 줄 추가:

```json
"test": "node --experimental-strip-types --disable-warning=ExperimentalWarning --test \"src/**/*.test.ts\""
```

`tsconfig.json`의 `compilerOptions`에 추가(`noEmit: true`라 허용됨. Node가 TS를 직접 실행할 때 `./x.ts` 확장자 import가 필요하다):

```json
"allowImportingTsExtensions": true,
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/utils/imageOptimizer.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  IMAGE_LIMITS,
  ImageOptimizeError,
  checkInput,
  describeResult,
  downscaleSteps,
  extFromMime,
  fitWithin,
  formatBytes,
  shouldKeepOriginal,
  type OptimizedImage,
} from "./imageOptimizer.ts";

const MB = 1024 * 1024;

describe("checkInput — 파일을 읽기 전 1차 검사", () => {
  it("이미지가 아니면 not-image", () => {
    const err = checkInput("text/plain", 100);
    assert.ok(err instanceof ImageOptimizeError);
    assert.equal(err.code, "not-image");
  });
  it("20MB 를 넘으면 too-large", () => {
    assert.equal(checkInput("image/jpeg", 21 * MB)?.code, "too-large");
    assert.equal(checkInput("image/jpeg", 20 * MB), null);
  });
  it("통과하면 null", () => {
    assert.equal(checkInput("image/png", MB), null);
  });
});

describe("fitWithin — 긴 변을 상한에 맞춘다", () => {
  it("가로 사진 4000×3000 → 1600×1200", () => {
    assert.deepEqual(fitWithin(4000, 3000, 1600), { width: 1600, height: 1200 });
  });
  it("세로 사진 3000×4000 → 1200×1600", () => {
    assert.deepEqual(fitWithin(3000, 4000, 1600), { width: 1200, height: 1600 });
  });
  it("상한 이하면 그대로(확대하지 않는다)", () => {
    assert.deepEqual(fitWithin(1200, 800, 1600), { width: 1200, height: 800 });
  });
});

describe("downscaleSteps — 절반 이하 축소는 단계를 나눈다", () => {
  it("4000×3000 → 1600×1200 은 2000×1500 을 거친다", () => {
    assert.deepEqual(downscaleSteps({ width: 4000, height: 3000 }, { width: 1600, height: 1200 }), [
      { width: 2000, height: 1500 },
      { width: 1600, height: 1200 },
    ]);
  });
  it("절반 이내 축소는 한 단계", () => {
    assert.deepEqual(downscaleSteps({ width: 2000, height: 1500 }, { width: 1600, height: 1200 }), [
      { width: 1600, height: 1200 },
    ]);
  });
  it("크기가 같으면 단계 없음", () => {
    assert.deepEqual(downscaleSteps({ width: 800, height: 600 }, { width: 800, height: 600 }), []);
  });
});

describe("shouldKeepOriginal — 재인코딩 없이 그대로 올릴 조건", () => {
  const small = { type: "image/webp", bytes: 200 * 1024, width: 1200, height: 800 };
  it("WebP·300KB 이하·1600px 이하면 유지", () => {
    assert.equal(shouldKeepOriginal(small), true);
  });
  it("300KB 를 넘으면 재인코딩", () => {
    assert.equal(shouldKeepOriginal({ ...small, bytes: 400 * 1024 }), false);
  });
  it("1600px 을 넘으면 재인코딩", () => {
    assert.equal(shouldKeepOriginal({ ...small, width: 1800 }), false);
  });
  it("PNG 는 작아도 재인코딩(사진 PNG 는 WebP 가 훨씬 작다)", () => {
    assert.equal(shouldKeepOriginal({ ...small, type: "image/png" }), false);
  });
  it("AVIF·JPEG 도 유지 대상", () => {
    assert.equal(shouldKeepOriginal({ ...small, type: "image/avif" }), true);
    assert.equal(shouldKeepOriginal({ ...small, type: "image/jpeg" }), true);
  });
});

describe("extFromMime", () => {
  it("MIME → 확장자", () => {
    assert.equal(extFromMime("image/webp"), "webp");
    assert.equal(extFromMime("image/jpeg"), "jpg");
    assert.equal(extFromMime("image/png"), "png");
    assert.equal(extFromMime("image/avif"), "avif");
  });
  it("모르는 MIME 은 파일명 확장자를 소문자로, 그것도 없으면 bin", () => {
    assert.equal(extFromMime("image/heic", "IMG_0001.HEIC"), "heic");
    assert.equal(extFromMime("application/octet-stream"), "bin");
  });
});

describe("formatBytes / describeResult — 화면 문구", () => {
  it("KB·MB 표기", () => {
    assert.equal(formatBytes(236 * 1024), "236KB");
    assert.equal(formatBytes(4.8 * MB), "4.8MB");
    assert.equal(formatBytes(20 * MB), "20MB");
  });
  const base: Omit<OptimizedImage, "action"> = {
    blob: new Blob([new Uint8Array(10)], { type: "image/webp" }),
    ext: "webp",
    width: 1600,
    height: 1067,
    originalBytes: 4.8 * MB,
    bytes: 236 * 1024,
  };
  it("줄였으면 전→후·크기·형식", () => {
    assert.equal(describeResult({ ...base, action: "resized+reencoded" }), "4.8MB → 236KB · 1600×1067 · WebP");
  });
  it("그대로면 이미 작다고 알린다", () => {
    assert.equal(
      describeResult({ ...base, action: "kept", originalBytes: 236 * 1024 }),
      "이미 작아서 그대로 올립니다 (236KB · 1600×1067)",
    );
  });
  it("상수는 스펙 값", () => {
    assert.deepEqual(IMAGE_LIMITS, { maxInputBytes: 20 * MB, maxEdge: 1600, targetBytes: 300 * 1024, qualities: [0.85, 0.78, 0.72] });
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/utils/imageOptimizer.ts'`

- [ ] **Step 4: 순수 함수 구현**

`src/utils/imageOptimizer.ts`(이 태스크에서는 순수 부분만. `optimizeImage`는 Task 2):

```ts
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
```

- [ ] **Step 5: 통과 확인**

Run: `npm test`
Expected: 모든 테스트 pass (≈ 20). 경고 없이 `# pass N` 출력.

Run: `npm run lint`
Expected: 오류 0.

- [ ] **Step 6: 커밋**

```bash
git add package.json tsconfig.json src/utils/imageOptimizer.ts src/utils/imageOptimizer.test.ts
git commit -m "feat(product): 이미지 최적화 규칙(순수 함수) + node:test 러너

브라우저 API 없이 검증 가능한 부분만: 입력 검사, 긴 변 맞춤, 단계 축소, 유지 판정, 확장자, 문구.
테스트는 의존성 없이 Node 22 의 --experimental-strip-types 로 실행한다(npm test).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: 브라우저 최적화 파이프라인 `optimizeImage`

**Files:**
- Modify: `src/utils/imageOptimizer.ts` (파일 끝에 추가)

**Interfaces:**
- Consumes: Task 1의 순수 함수·타입 전부
- Produces: `optimizeImage(file: File, limits?: ImageLimits): Promise<OptimizedImage>` — 실패 시 `ImageOptimizeError`(code 로 구분) throw

- [ ] **Step 1: 파이프라인 구현**

`src/utils/imageOptimizer.ts` 끝에 추가:

```ts
// ---------- 브라우저 파이프라인 (아래는 canvas·createImageBitmap 을 쓴다) ----------

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

function makeCanvas(size: Size): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(size.width, size.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
}

function isOffscreen(canvas: AnyCanvas): canvas is OffscreenCanvas {
  return typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas;
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
```

- [ ] **Step 2: 타입 검사·린트**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint && npm test`
Expected: 오류 0, 테스트 pass. (`OffscreenCanvas`·`convertToBlob` 은 `lib: ["dom"]` 에 있다. 오류가 나면 `steps[0]!` 의 non-null 단언이 `@typescript-eslint/no-non-null-assertion` 규칙에 걸리는지 확인 — eslint-config-next 기본은 허용.)

- [ ] **Step 3: 커밋**

```bash
git add src/utils/imageOptimizer.ts
git commit -m "feat(product): optimizeImage — 단계 축소 + WebP/JPEG 품질 사다리 인코딩

createImageBitmap 으로 디코드(EXIF 회전 반영) → 절반씩 단계 축소 → WebP 0.85/0.78/0.72,
WebP 인코더가 없으면 JPEG. 이미 작은 압축 포맷은 그대로, 재인코딩이 커지면 원본.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: 화이트리스트·검증에 `image_url` 추가 + 업로드 경로 빌더

**Files:**
- Modify: `src/types/index.ts:196-202` (`EditableProductPatch`)
- Modify: `src/utils/adminProduct.ts`
- Test: `src/utils/adminProduct.test.ts`

**Interfaces:**
- Produces:
  - `EditableProductPatch.image_url?: string`
  - `editableFieldsFor(type)` 가 세 타입 모두 `"image_url"` 포함(첫 번째)
  - `validateImagePath(path: unknown): string | null`
  - `PRODUCT_IMAGE_PREFIX = "products"`, `buildProductImagePath(table: ProductTable, ext: string, id?: string): string` → `products/<table>/<id>.<ext>`
  - `FIELD_LABELS.image_url === "이미지"`, `formatFieldValue("image_url", v)` → 파일명 또는 `(없음)`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/utils/adminProduct.test.ts`:

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCT_IMAGE_PREFIX,
  buildProductImagePath,
  diffEditable,
  editableFieldsFor,
  formatFieldValue,
  pickEditablePatch,
  validateImagePath,
  validatePatch,
} from "./adminProduct.ts";

describe("editableFieldsFor — image_url 은 세 타입 모두, items 는 선물세트만", () => {
  it("menu_item", () => {
    assert.deepEqual(editableFieldsFor("menu_item"), ["image_url", "price", "description", "is_active"]);
  });
  it("gift_set", () => {
    assert.deepEqual(editableFieldsFor("gift_set"), ["image_url", "price", "description", "is_active", "items"]);
  });
});

describe("pickEditablePatch — image_url", () => {
  it("문자열이면 trim 해서 통과", () => {
    assert.deepEqual(pickEditablePatch("menu_item", { image_url: "  products/menu_items/a.webp " }), {
      image_url: "products/menu_items/a.webp",
    });
  });
  it("문자열이 아니면 버린다", () => {
    assert.deepEqual(pickEditablePatch("menu_item", { image_url: 123 }), {});
  });
  it("name 처럼 화이트리스트 밖 키는 여전히 버린다", () => {
    assert.deepEqual(pickEditablePatch("menu_item", { name: "x" }), {});
  });
});

describe("validateImagePath / validatePatch — DB CHECK 와 같은 규칙", () => {
  it("빈 값", () => {
    assert.equal(validateImagePath(""), "이미지 경로가 없습니다.");
    assert.equal(validateImagePath(undefined), "이미지 경로가 없습니다.");
  });
  it("외부 URL·경로 탈출 거부", () => {
    assert.equal(validateImagePath("https://evil.example/x.png"), "이미지 경로 형식이 잘못되었습니다.");
    assert.equal(validateImagePath("../x.png"), "이미지 경로 형식이 잘못되었습니다.");
  });
  it("새 경로와 레거시 경로는 통과(되돌리기가 레거시를 다시 쓴다)", () => {
    assert.equal(validateImagePath("products/menu_items/3f2a.webp"), null);
    assert.equal(validateImagePath("menu/menu001.avif"), null);
    assert.equal(validateImagePath("/images/menu/menu001.avif"), null);
  });
  it("validatePatch 가 image_url 을 검사한다", () => {
    assert.equal(validatePatch({ image_url: "http://x/y" }), "이미지 경로 형식이 잘못되었습니다.");
    assert.equal(validatePatch({ image_url: "products/gift_sets/a.jpg", price: 1000 }), null);
  });
});

describe("formatFieldValue / diffEditable — image_url", () => {
  it("파일명만 보여준다", () => {
    assert.equal(formatFieldValue("image_url", "products/menu_items/abc.webp"), "abc.webp");
    assert.equal(formatFieldValue("image_url", null), "(없음)");
  });
  it("경로가 바뀌면 변경으로 잡고, null 과 빈 문자열은 같은 값", () => {
    const before = { image_url: "menu/a.avif", price: 1 };
    assert.deepEqual(
      diffEditable("menu_item", before, { ...before, image_url: "products/menu_items/b.webp" }).map((c) => c.field),
      ["image_url"],
    );
    assert.deepEqual(diffEditable("menu_item", { image_url: null }, { image_url: "" }), []);
  });
});

describe("buildProductImagePath", () => {
  it("products/<table>/<id>.<ext>", () => {
    assert.equal(PRODUCT_IMAGE_PREFIX, "products");
    assert.equal(buildProductImagePath("menu_items", "webp", "fixed-id"), "products/menu_items/fixed-id.webp");
  });
  it("id 를 안 주면 uuid", () => {
    assert.match(
      buildProductImagePath("gift_sets", "jpg"),
      /^products\/gift_sets\/[0-9a-f-]{36}\.jpg$/,
    );
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL — `validateImagePath`·`buildProductImagePath`·`PRODUCT_IMAGE_PREFIX` export 없음, `editableFieldsFor` 배열 불일치.

- [ ] **Step 3: 타입 수정**

`src/types/index.ts` 196-202를 다음으로 교체:

```ts
// 관리자가 수정할 수 있는 상품 컬럼 (이 다섯 개가 전부. items는 gift_sets만).
// image_url 은 Storage 상대 경로(products/<table>/<uuid>.<ext>) — 외부 URL 은 DB CHECK 가 거부한다.
export type EditableProductPatch = {
  image_url?: string;
  price?: number;
  description?: string;
  is_active?: boolean;
  items?: string[];
};
```

- [ ] **Step 4: adminProduct.ts 수정**

`FIELD_LABELS` 를 교체:

```ts
export const FIELD_LABELS: Record<EditableField, string> = {
  image_url: "이미지",
  price: "가격",
  description: "설명",
  is_active: "노출",
  items: "구성품",
};
```

`editableFieldsFor` 를 교체(이미지가 대조표 맨 위에 오도록 첫 번째):

```ts
/** 상품 타입별 편집 가능 필드. items는 선물세트만. 순서 = 대조표·이력 요약 순서 */
export function editableFieldsFor(productType: ProductType): EditableField[] {
  return productType === "gift_set"
    ? ["image_url", "price", "description", "is_active", "items"]
    : ["image_url", "price", "description", "is_active"];
}
```

`pickEditablePatch` 의 `switch` 에 case 추가(`case "price":` 위):

```ts
      case "image_url":
        if (typeof value === "string") patch.image_url = value.trim();
        break;
```

`validatePatch` 위에 함수 추가하고, `validatePatch` 첫 줄에 호출을 넣는다:

```ts
/**
 * 이미지 경로 검증 — DB CHECK(admin_image.sql)와 같은 규칙: 외부 URL(`://`)·경로 탈출(`..`) 거부.
 * 접두사는 강제하지 않는다. 이력 되돌리기가 레거시 `menu/…` 경로를 다시 써야 한다.
 */
export function validateImagePath(path: unknown): string | null {
  if (typeof path !== "string" || path.length === 0) return "이미지 경로가 없습니다.";
  if (path.includes("://") || path.includes("..")) return "이미지 경로 형식이 잘못되었습니다.";
  return null;
}
```

```ts
export function validatePatch(patch: EditableProductPatch): string | null {
  if ("image_url" in patch) {
    const imageError = validateImagePath(patch.image_url);
    if (imageError) return imageError;
  }
  if ("price" in patch) {
```

`formatFieldValue` 의 `switch` 에 case 추가(`case "price":` 위):

```ts
    case "image_url": {
      if (typeof value !== "string" || value.length === 0) return "(없음)";
      return value.split("/").pop() ?? value;
    }
```

파일 끝에 추가:

```ts
/** Storage 안에서 관리자가 올리는 상품 이미지의 접두사. Storage 정책(storage_policies.sql)이 이 접두사에만 쓰기를 허용한다 */
export const PRODUCT_IMAGE_PREFIX = "products";

/**
 * 업로드 경로 `products/<테이블명>/<uuid>.<ext>`. 매번 새 이름 — 같은 이름을 덮어쓰면 CDN·브라우저 캐시가
 * 옛 그림을 보여준다. 고유 이름이라 cacheControl 을 길게 줄 수 있다.
 */
export function buildProductImagePath(table: ProductTable, ext: string, id: string = crypto.randomUUID()): string {
  return `${PRODUCT_IMAGE_PREFIX}/${table}/${id}.${ext}`;
}
```

- [ ] **Step 5: 통과 확인**

Run: `npm test && npm run lint`
Expected: pass, 오류 0. (`isSameValue` 는 문자열을 `normalize` 로 비교하므로 image_url 에 추가 수정 불필요.)

- [ ] **Step 6: 커밋**

```bash
git add src/types/index.ts src/utils/adminProduct.ts src/utils/adminProduct.test.ts
git commit -m "feat(product): 편집 화이트리스트에 image_url 추가 + 경로 검증·업로드 경로 빌더

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: `storageService` + 에러 메시지 분기

**Files:**
- Create: `src/services/storage.ts`
- Modify: `src/services/index.ts`
- Modify: `src/services/admin.ts:12-22` (`toFriendlyError`)

**Interfaces:**
- Consumes: `buildProductImagePath`, `PRODUCT_IMAGE_PREFIX`, `ProductTable` (Task 3); `supabase` (`@/lib/supabase`)
- Produces (Task 8이 쓴다):
  - `storageService.uploadProductImage(table: ProductTable, blob: Blob, ext: string): Promise<string>` — 저장할 상대 경로 반환, 실패 시 사용자 문구 Error
  - `storageService.removeProductImage(path: string): Promise<void>` — best-effort, throw 하지 않음, `products/` 밖 경로는 무시

- [ ] **Step 1: storage.ts 작성**

```ts
import { supabase } from "@/lib/supabase";
import { PRODUCT_IMAGE_PREFIX, buildProductImagePath, type ProductTable } from "@/utils/adminProduct";

/**
 * 관리자 상품 이미지 Storage API.
 * 모달 밖에 두는 이유: 후속 "상품 추가"(INSERT 전 업로드, 실패 시 회수)와 "삭제"(파일 정리)가 같은 함수를 쓴다.
 * 권한은 Storage 정책(storage_policies.sql: products/ 아래는 is_admin() 만)이 최종 판정.
 */

const BUCKET = "images";

// storage-js 의 StorageApiError 는 status(number)·statusCode(string) 를 갖지만 타입이 느슨하다
function toFriendlyStorageError(error: { message: string; status?: number; statusCode?: string | number }): Error {
  const status = String(error.status ?? error.statusCode ?? "");
  if (status === "403" || /row-level security|unauthorized|not allowed/i.test(error.message)) {
    return new Error("이미지 업로드 권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.");
  }
  return new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
}

export const storageService = {
  /** products/<table>/<uuid>.<ext> 에 올리고 DB 에 저장할 상대 경로를 돌려준다 */
  async uploadProductImage(table: ProductTable, blob: Blob, ext: string): Promise<string> {
    const path = buildProductImagePath(table, ext);
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || undefined,
      // 이름이 매번 고유하므로 오래 캐시해도 안전하고, 덮어쓰기가 필요 없다
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("Error uploading product image:", error);
      throw toFriendlyStorageError(error);
    }
    return path;
  },

  /**
   * 업로드 뒤 UPDATE 가 실패했을 때 방금 올린 파일을 회수한다(후속 상품 삭제 흐름도 재사용).
   * best-effort — 실패해도 던지지 않는다. products/ 밖(레거시 menu/…)은 건드리지 않는다.
   */
  async removeProductImage(path: string): Promise<void> {
    if (!path.startsWith(`${PRODUCT_IMAGE_PREFIX}/`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) console.error("Error removing product image:", error);
  },
};
```

- [ ] **Step 2: barrel export**

`src/services/index.ts` 의 `export { adminService } from './admin';` 아래에 추가:

```ts
export { storageService } from './storage';
```

- [ ] **Step 3: admin.ts 에러 분기**

`src/services/admin.ts` 의 `toFriendlyError` 에서 `case '23514':` 블록을 교체:

```ts
    case '23514':    // check_violation — 제약 이름으로 가른다 (price_range / image_url_path)
      return error.message.includes('image_url_path')
        ? new Error('이미지 경로 형식이 잘못되었습니다.')
        : new Error('가격은 1원 이상 1,000,000원 이하여야 합니다.');
```

- [ ] **Step 4: 타입·린트**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint && npm test`
Expected: 오류 0. (`upload` 옵션의 `contentType: undefined` 가 타입 오류를 내면 `...(blob.type ? { contentType: blob.type } : {})` 로 바꾼다.)

- [ ] **Step 5: 커밋**

```bash
git add src/services/storage.ts src/services/index.ts src/services/admin.ts
git commit -m "feat(product): storageService(상품 이미지 업로드·회수) + CHECK 위반 메시지 분기

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Storage 정책 SQL + 검증 SQL

**Files:**
- Create: `supabase/storage_policies.sql`
- Create: `supabase/storage_policies_verify.sql`

**Interfaces:**
- Consumes: `public.is_admin()` (기존 `admin_edit.sql`)
- Produces: 정책 `Users manage own avatar`, `Admins manage product images` on `storage.objects`

- [ ] **Step 1: storage_policies.sql 작성**

```sql
-- =====================================================
-- Storage 정책 정비 (2026-09-17). Supabase SQL Editor에서 1회 실행. 재실행 안전(DROP IF EXISTS).
-- 설계: docs/superpowers/specs/2026-09-17-admin-product-image-design.md §4-1
--
-- 배경: 기존 정책 "Authenticated users can manage images"(FOR ALL, bucket_id = 'images')가
-- 로그인한 모든 사용자에게 버킷 전체 조회·업로드·덮어쓰기·삭제를 허용했다(상품 이미지·배너·타인 아바타 포함).
-- 버킷은 public 이라 표시용 URL(/storage/v1/object/public/…)은 정책과 무관하게 읽힌다.
-- 정책은 API(list·upload·remove)에만 걸린다.
--
-- 사전 확인(선택): 현재 정책 목록
--   SELECT policyname, cmd, roles, qual FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can manage images" ON storage.objects;

-- 아바타: 본인 파일(avatars/<uid>.<ext>)만. 기존 authService.uploadAvatar 의 list → remove → upload 가 그대로 동작한다.
DROP POLICY IF EXISTS "Users manage own avatar" ON storage.objects;
CREATE POLICY "Users manage own avatar" ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'images' AND name LIKE 'avatars/' || auth.uid()::text || '.%')
  WITH CHECK (bucket_id = 'images' AND name LIKE 'avatars/' || auth.uid()::text || '.%');

-- 상품 이미지: products/ 아래는 관리자만(조회·업로드·덮어쓰기·삭제).
-- 삭제까지 여는 이유: UPDATE 실패 시 방금 올린 파일 회수 + 후속 상품 추가/삭제 흐름이 그대로 쓴다.
-- 기존 menu/·banners/·sns/·videos/ 는 이제 브라우저에서 아무도 쓸 수 없다(대시보드 전용).
DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
CREATE POLICY "Admins manage product images" ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'images' AND name LIKE 'products/%' AND public.is_admin())
  WITH CHECK (bucket_id = 'images' AND name LIKE 'products/%' AND public.is_admin());

-- =====================================================
-- 롤백 (필요 시 주석 해제 후 실행) — 마이그레이션 전의 넓은 정책으로 복원
-- =====================================================
-- DROP POLICY IF EXISTS "Users manage own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
-- CREATE POLICY "Authenticated users can manage images" ON storage.objects
--   FOR ALL TO authenticated
--   USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');
```

- [ ] **Step 2: storage_policies_verify.sql 작성**

```sql
-- =====================================================
-- storage_policies.sql 검증 — Supabase SQL Editor에서 실행. 전부 BEGIN … ROLLBACK 이라 실 데이터는 바뀌지 않는다.
-- <일반 유저 uuid>, <관리자 uuid>는 SELECT id, email FROM auth.users; 로 확인해 채운다.
-- storage.objects 에 직접 행을 넣어 정책만 확인한다(실제 파일은 만들지 않는다). 기대값은 각 줄 주석.
-- 에러가 나는 검사는 각각 독립 트랜잭션이다 — 한 트랜잭션 안에서 에러가 나면 이후 명령이 전부
-- "current transaction is aborted" 로만 실패해 에러 코드를 구분할 수 없다.
-- =====================================================

-- (A) 일반 유저: 상품 폴더 업로드 불가
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp');  -- ERROR 42501 (RLS)
ROLLBACK;

-- (A-2) 일반 유저: 타인 아바타 불가
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/<관리자 uuid>.png');        -- ERROR 42501
ROLLBACK;

-- (A-3) 일반 유저: 본인 아바타는 가능, 상품 image_url 은 RLS 로 0행
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/<일반 유저 uuid>.png');      -- INSERT 0 1
SELECT count(*) FROM storage.objects WHERE name = 'avatars/<일반 유저 uuid>.png';                    -- 1 (본인 파일은 보임)
UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = '모찌';           -- UPDATE 0
ROLLBACK;

-- (B) 관리자: products/ 업로드·삭제 가능, 기존 폴더는 불가 — 실행 전 관리자 uuid 에 role='admin' 이 있어야 한다
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
SELECT public.is_admin();                                                                          -- true
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp');  -- INSERT 0 1
DELETE FROM storage.objects WHERE name = 'products/menu_items/verify.webp';                        -- DELETE 1
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'menu/verify.webp');                -- ERROR 42501 (기존 폴더는 닫힘)
ROLLBACK;

-- (C) 관리자: image_url UPDATE + CHECK — admin_image.sql 실행 후에만 의미 있음
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = '모찌';           -- UPDATE 1
SELECT before->>'image_url', after->>'image_url' FROM product_revisions
  WHERE table_name = 'menu_items' AND record_id = (SELECT id FROM menu_items WHERE name = '모찌')
  ORDER BY changed_at DESC LIMIT 1;                                                                -- menu/…, products/menu_items/verify.webp
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET image_url = 'https://evil.example/x.png' WHERE name = '모찌';               -- ERROR 23514 (menu_items_image_url_path)
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET image_url = '../x.png' WHERE name = '모찌';                                   -- ERROR 23514
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET name = '검증' WHERE name = '모찌';                                            -- ERROR 42501 (컬럼 GRANT 밖, 회귀 확인)
ROLLBACK;
```

- [ ] **Step 3: 눈으로 재검토**

`admin_edit.sql` 의 `is_admin()` 정의(SECURITY DEFINER, `GRANT EXECUTE … TO authenticated`)가 있어 정책 안에서 호출 가능함을 확인한다. `name LIKE 'avatars/' || auth.uid()::text || '.%'` 의 `.%`가 `avatars/<uid>.png` 와 `avatars/<uid>.jpeg` 를 모두 맞추고 `avatars/<uid>2.png` 는 맞추지 않음을 확인한다.

- [ ] **Step 4: 커밋**

```bash
git add supabase/storage_policies.sql supabase/storage_policies_verify.sql
git commit -m "feat(product): Storage 정책 정비 — 아바타는 본인 파일만, products/ 는 관리자만

기존 'Authenticated users can manage images'(FOR ALL) 가 로그인 사용자 전체에게 버킷 전체
쓰기·삭제를 허용하고 있었다(2026-09-17 조사). 검증 SQL 동봉.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: `admin_image.sql` — 컬럼 GRANT·CHECK

**Files:**
- Create: `supabase/admin_image.sql`
- Modify: `supabase/admin_edit.sql` (§3b 주석 한 줄)

- [ ] **Step 1: admin_image.sql 작성**

```sql
-- =====================================================
-- 관리자 상품 이미지 교체 마이그레이션 (2026-09-17). Supabase SQL Editor에서 1회 실행. 재실행 안전.
-- 설계: docs/superpowers/specs/2026-09-17-admin-product-image-design.md §4-2
-- 선행: admin_edit.sql (RLS·is_admin·컬럼 GRANT 4개), storage_policies.sql (products/ 업로드 권한)
-- =====================================================

-- -----------------------------------------------------
-- 1. 편집 가능 컬럼에 image_url 추가 (admin_edit.sql §3b 컬럼 GRANT 확장). RLS UPDATE 정책은 이미 관리자 한정.
-- -----------------------------------------------------
GRANT UPDATE (image_url) ON menu_items        TO authenticated;
GRANT UPDATE (image_url) ON gift_sets         TO authenticated;
GRANT UPDATE (image_url) ON reciprocate_items TO authenticated;

-- -----------------------------------------------------
-- 2. 사전 확인 — 아래 CHECK 를 위반하는 기존 행. 정상 데이터(menu/…, /images/…)는 전부 0.
--    0이 아니면 그 행의 image_url 을 먼저 고친 뒤 3을 실행한다.
-- -----------------------------------------------------
SELECT 'menu_items' AS t, count(*) FROM menu_items        WHERE image_url LIKE '%://%' OR image_url LIKE '%..%'
UNION ALL SELECT 'gift_sets', count(*) FROM gift_sets     WHERE image_url LIKE '%://%' OR image_url LIKE '%..%'
UNION ALL SELECT 'reciprocate_items', count(*) FROM reciprocate_items WHERE image_url LIKE '%://%' OR image_url LIKE '%..%';

-- -----------------------------------------------------
-- 3. 외부 URL·경로 탈출 차단 — 관리자 세션이 탈취돼도 DB 가 거부한다.
--    상대 경로(menu/…, products/…, 레거시 /images/…)는 전부 통과하는 느슨한 규칙이라 기존 행을 막지 않는다.
--    클라이언트(validateImagePath)도 같은 규칙.
-- -----------------------------------------------------
ALTER TABLE menu_items        DROP CONSTRAINT IF EXISTS menu_items_image_url_path;
ALTER TABLE menu_items        ADD  CONSTRAINT menu_items_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));

ALTER TABLE gift_sets         DROP CONSTRAINT IF EXISTS gift_sets_image_url_path;
ALTER TABLE gift_sets         ADD  CONSTRAINT gift_sets_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));

ALTER TABLE reciprocate_items DROP CONSTRAINT IF EXISTS reciprocate_items_image_url_path;
ALTER TABLE reciprocate_items ADD  CONSTRAINT reciprocate_items_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));

-- 이력: admin_edit.sql 의 log_product_revision 트리거가 행 전체를 JSONB 로 남기므로 image_url 변경도 자동 기록. 추가 작업 없음.

-- =====================================================
-- 롤백 (필요 시 주석 해제 후 실행). 올라간 products/ 파일과 image_url 값은 데이터라 건드리지 않는다.
-- =====================================================
-- REVOKE UPDATE (image_url) ON menu_items, gift_sets, reciprocate_items FROM authenticated;
-- ALTER TABLE menu_items        DROP CONSTRAINT IF EXISTS menu_items_image_url_path;
-- ALTER TABLE gift_sets         DROP CONSTRAINT IF EXISTS gift_sets_image_url_path;
-- ALTER TABLE reciprocate_items DROP CONSTRAINT IF EXISTS reciprocate_items_image_url_path;
```

- [ ] **Step 2: admin_edit.sql §3b 에 연결 주석**

`supabase/admin_edit.sql` 에서 다음 줄

```sql
--  참고: 상품 추가/삭제는 정책 부재로 이미 막히지만, 권한도 함께 회수해 의도를 명시한다.
```

바로 아래에 한 줄 추가:

```sql
--  참고: image_url 은 admin_image.sql(2026-09-17)에서 GRANT UPDATE 를 추가했다 — 편집 가능 컬럼은 총 5개.
```

- [ ] **Step 3: 커밋**

```bash
git add supabase/admin_image.sql supabase/admin_edit.sql
git commit -m "feat(product): admin_image.sql — image_url 컬럼 GRANT + 외부 URL·경로 탈출 CHECK

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: `ProductImageField` 컴포넌트

**Files:**
- Create: `src/components/admin/ProductImageField.tsx`

**Interfaces:**
- Consumes: `OptimizedImage`, `describeResult`, `formatBytes`, `IMAGE_LIMITS` (Task 1); `getStorageUrl` (`@/lib/supabase`)
- Produces (Task 8이 쓴다):
  - `export interface PendingImage { optimized: OptimizedImage; previewUrl: string }`
  - `export default function ProductImageField(props: { currentPath: string | null | undefined; pending: PendingImage | null; isOptimizing: boolean; disabled?: boolean; onPick: (file: File) => void; onClear: () => void })`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
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
```

- [ ] **Step 2: 타입·린트**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: 오류 0. (`hidden` 속성이 styled 없는 `<input>` 에 그대로 쓰인다. `no-img-element` 는 disable 주석으로 억제.)

- [ ] **Step 3: 커밋**

```bash
git add src/components/admin/ProductImageField.tsx
git commit -m "feat(ui): ProductImageField — 상품 이미지 미리보기·파일 선택·최적화 결과 표시

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: 모달 통합 — 선택·최적화·대조표·저장 시 업로드

**Files:**
- Modify: `src/components/admin/ProductEditModal.tsx`

**Interfaces:**
- Consumes: `ProductImageField`, `PendingImage` (Task 7); `optimizeImage`, `describeResult` (Task 1·2); `storageService` (Task 4); `PRODUCT_TABLES` (Task 3); `getStorageUrl` (`@/lib/supabase`)

- [ ] **Step 1: import 추가**

파일 상단 import 를 다음으로 바꾼다(기존 줄 유지 + 추가):

```tsx
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
```

- [ ] **Step 2: FormState 에 image_url**

```ts
type FormState = {
  image_url: string;
  price: string;
  description: string;
  is_active: boolean;
  items: string[];
};

function toForm(source: Record<string, unknown>): FormState {
  return {
    image_url: typeof source.image_url === "string" ? source.image_url : "",
    price: source.price == null ? "" : String(source.price),
    description: typeof source.description === "string" ? source.description : "",
    is_active: source.is_active !== false,
    items: Array.isArray(source.items) ? source.items.map(String) : [],
  };
}

function fromForm(form: FormState): Record<string, unknown> {
  return {
    image_url: form.image_url,
    price: form.price.trim() === "" ? NaN : Number(form.price),
    description: form.description,
    is_active: form.is_active,
    items: form.items,
  };
}
```

- [ ] **Step 3: 대조표 썸네일 스타일 추가**

`DiffTable` 정의 아래에 추가:

```ts
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
```

- [ ] **Step 4: 상태·핸들러 추가**

`const [revisionsOpen, setRevisionsOpen] = useState(false);` 아래에 추가:

```ts
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
```

- [ ] **Step 5: prepareConfirm — 이미지만 바뀐 경우도 변경으로**

`prepareConfirm` 의 시그니처를 두 인자로 바꾼다. 두 번째 인자는 되돌리기(Step 7)가 "고른 이미지를 버린 상태"로 부를 수 있게 한 것이다(상태 갱신은 다음 렌더에 반영되므로 인자로 넘긴다).

```ts
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
```

저장 버튼은 `prepareConfirm(form)` 그대로(기본 인자가 현재 `pendingImage` 를 본다).

- [ ] **Step 6: handleConfirm — 업로드 → UPDATE → 실패 시 회수**

`handleConfirm` 전체를 교체:

```ts
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
```

- [ ] **Step 7: handleRevert — 되돌리기는 고른 이미지를 버린다**

```ts
  // 이력의 before 값을 폼에 얹고 바로 확인 단계로 (되돌리기도 updateProduct를 그대로 탄다).
  // 고른 새 이미지는 버린다 — 되돌리기는 "그 시점 값으로 완전히 돌아가기"다. 이전 파일은 지우지 않았으므로
  // 옛 경로가 살아 있다. setPendingImage(null) 은 다음 렌더에 반영되므로 hasPendingImage=false 를 직접 넘긴다.
  const handleRevert = (revision: ProductRevision) => {
    setPendingImage(null);
    const restored = toForm({ ...productRecord, ...revision.before });
    setForm(restored);
    prepareConfirm(restored, false);
  };
```

- [ ] **Step 8: 편집 단계에 이미지 항목 배치**

`<Body>` 바로 안, 가격 `Field` 위에 추가:

```tsx
              <ProductImageField
                currentPath={form.image_url || product.image_url}
                pending={pendingImage}
                isOptimizing={isOptimizing}
                disabled={isSaving}
                onPick={handlePickImage}
                onClear={handleClearImage}
              />
```

저장 버튼을 최적화 중에는 잠근다:

```tsx
              <PrimaryButton type="button" onClick={() => prepareConfirm(form)} disabled={isOptimizing}>
                저장
              </PrimaryButton>
```

- [ ] **Step 9: 확인 단계 대조표 — 이미지 행**

`<DiffTable>` 의 `<tbody>` 전체를 다음으로 교체한다(새 이미지 행 + `image_url` 필드(되돌리기 경로)는 썸네일):

```tsx
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
```

- [ ] **Step 10: 게이트**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.json && npm test && npm run build`
Expected: 전부 통과. `build` 에서 `ProductEditModal` 관련 경고 없음.

- [ ] **Step 11: 로컬 dev 스모크 (관리자 계정 없이 가능한 범위)**

Run: `npm run dev` (3001) → 브라우저에서 `/represent` 가 정상 렌더되고 콘솔 오류가 없는지 확인. 관리자 모달 시나리오(스펙 §10 1~9)는 DB 마이그레이션 후 사용자가 실 계정으로 확인한다(Task 10 체크리스트).

- [ ] **Step 12: 커밋**

```bash
git add src/components/admin/ProductEditModal.tsx
git commit -m "feat(product): 상품 수정 모달에 이미지 교체 — 선택·최적화·대조표 썸네일·저장 시 업로드

업로드는 확인 단계 저장 시점에만. UPDATE 가 실패하면 방금 올린 파일을 회수한다.
되돌리기는 고른 이미지를 버리고 이력 값으로 돌아간다(이전 파일 보존).

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: 문서 — README 운영 절차, CLAUDE.md 규칙

**Files:**
- Modify: `README.md` ("## 관리자 상품 편집 (운영 절차)" 절)
- Modify: `CLAUDE.md` ("## DB 스키마 (현재)", "### 이미지 처리", "### 관리자 상품 편집")

- [ ] **Step 1: README §0 에 두 SQL 추가**

"### 0. DB 마이그레이션 (1회, 배포 전에 먼저)" 목록 2번 뒤에 추가:

```markdown
3. **(2026-09-17 이미지 교체)** `supabase/storage_policies.sql` → `supabase/admin_image.sql` 순서로 실행. 둘 다 재실행 안전. `admin_image.sql` 의 2번 사전 확인 쿼리가 0이 아니면 그 행의 `image_url`을 먼저 고친다.
4. `supabase/storage_policies_verify.sql`로 검증 — (A) 일반 유저는 상품 폴더·타인 아바타에 쓰지 못하고, (B) 관리자는 `products/`에만 쓸 수 있고, (C) 외부 URL은 DB가 거부한다. 기존 정책 `Authenticated users can manage images`(로그인 사용자 전체에게 버킷 전체 쓰기)는 이때 사라진다 — 기존 `menu/`·`banners/` 파일은 대시보드에서만 관리한다.
```

"### 사용법" 첫 항목을 다음으로 교체:

```markdown
- 카드/상세의 수정 버튼 → **이미지 변경**·가격·설명·(선물세트) 구성품·노출 토글 → **저장** → 전/후 대조표 확인 → **확인하고 수정**.
- 이미지는 JPG·PNG·WebP, 20MB 이하. 올리기 전에 브라우저가 긴 변 1600px·WebP(품질 0.85~0.72)·300KB 안팎으로 자동 최적화한다(휴대폰 원본 4~8MB → 200~300KB). 이미 작은 이미지는 그대로 올라간다. 파일은 `images/products/<테이블>/<uuid>.webp` 로 매번 새 이름이 붙고 이전 파일은 남는다(수정 이력의 되돌리기가 이미지에도 동작).
```

- [ ] **Step 2: CLAUDE.md 갱신**

"## DB 스키마 (현재)" 코드 블록의 `menu_items (...)` 줄 아래(세 상품 테이블 다음)에 주석 추가:

```sql
  -- image_url: Storage 상대 경로(menu/…, products/<table>/<uuid>.<ext>). CHECK 로 '://'·'..' 거부(admin_image.sql)
```

"### 이미지 처리" 절 코드 블록 뒤에 단락 추가:

```markdown
- **관리자 업로드 경로**: `products/<테이블명>/<uuid>.<ext>`(`buildProductImagePath`). 이름을 매번 새로 만들어 캐시 문제를 피하고 `cacheControl` 1년. 이전 파일은 지우지 않는다(이력 되돌리기).
- **업로드 전 최적화**: `src/utils/imageOptimizer.ts` 가 규칙의 단일 출처 — 입력 20MB, 긴 변 1600px, WebP 0.85→0.78→0.72(목표 300KB, 그 아래로는 안 내려감), Safari 는 JPEG 폴백, 이미 작은 압축 포맷은 그대로. 상수를 바꾸면 README 사용법도 함께.
- **Storage 정책**(`supabase/storage_policies.sql`): `avatars/<본인 uid>.*` 는 본인만, `products/` 는 `is_admin()` 만. 그 외 폴더(`menu/`·`banners/`…)는 브라우저에서 쓸 수 없다(대시보드 전용). 새 업로드 기능은 `products/` 아래에 두거나 정책을 함께 늘려야 한다.
```

"### 관리자 상품 편집" 절의 "쓰기:" 항목을 교체하고 항목 하나를 추가:

```markdown
- 쓰기: `adminService.updateProduct(productType, id, patch)` — 브라우저에서 바로 UPDATE, **RLS가 유일한 보안 경계**. 화이트리스트 5컬럼(`image_url`, `price`, `description`, `is_active`, `items`)만 통과. 컬럼을 늘리면 `admin_image.sql` 처럼 `GRANT UPDATE (…)` 도 같이(안 그러면 42501).
- 이미지: `ProductImageField`(선택·미리보기) → `optimizeImage` → 확인 단계 저장 시 `storageService.uploadProductImage` → 같은 `updateProduct`. UPDATE 실패 시 `removeProductImage` 로 방금 올린 파일 회수. 되돌리기는 고른 이미지를 버리고 이력 값으로.
```

"## 개발 명령어" 코드 블록에 추가:

```bash
npm test        # 순수 로직 단위 테스트 (node:test, 의존성 없음)
```

- [ ] **Step 3: 커밋**

```bash
git add README.md CLAUDE.md
git commit -m "docs(product): 이미지 교체 운영 절차(SQL 순서·검증)와 규칙(최적화·경로·Storage 정책) 기록

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: 최종 게이트 + 인수 체크리스트

**Files:** 없음(검증만)

- [ ] **Step 1: 전체 게이트**

Run: `npm run lint && npm test && npm run build`
Expected: 전부 통과.

- [ ] **Step 2: 브랜치 상태 확인**

Run: `git log --oneline main..HEAD`
Expected: 스펙·계획 커밋 + Task 1~9 커밋(총 11개 안팎). `git status` 깨끗.

- [ ] **Step 3: 사용자 인수 체크리스트를 보고서에 포함**

1. SQL Editor: `storage_policies.sql` → `admin_image.sql` → `storage_policies_verify.sql` (A)(B)(C) 기대값 대조.
2. 브랜치를 로컬에서 `npm run dev` 로 띄우고 관리자 계정으로 스펙 §10 시나리오 1~9 확인(8MB JPEG 축소, 작은 WebP 유지, EXIF 세로 사진, 되돌리기, UPDATE 실패 회수, 일반 계정 403, 프로필 사진 회귀, Safari JPEG 폴백).
3. 통과하면 main 머지(fast-forward) → Vercel 자동 배포. **SQL 이 먼저.**
