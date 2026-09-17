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
    assert.match(buildProductImagePath("gift_sets", "jpg"), /^products\/gift_sets\/[0-9a-f-]{36}\.jpg$/);
  });
});
