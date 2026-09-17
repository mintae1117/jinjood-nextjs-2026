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
