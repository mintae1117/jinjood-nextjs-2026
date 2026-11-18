import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 관리자 상품 수정 직후, 미리 만들어 둔 공개 페이지를 다시 만들게 한다.
 *
 * 홈·목록·상세는 정적 + 1시간 재생성이라 그대로 두면 손님에게는 수정이 최대 1시간 뒤에 보인다.
 * 저장은 브라우저에서 Supabase 로 바로 가므로 서버는 변경을 모른다 — 그래서 저장 뒤 여기를 부른다.
 * 관리자만 통과한다(DB 의 is_admin() 으로 판정). 실패해도 저장 자체에는 영향이 없다.
 */

const SEGMENTS = {
  menu_item: "represent",
  gift_set: "gifts",
  reciprocate_item: "reciprocate",
} as const;

type ProductType = keyof typeof SEGMENTS;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: { productType?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { productType, id } = body;
  if (!productType || !(productType in SEGMENTS) || !id || !UUID.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const segment = SEGMENTS[productType as ProductType];
  const paths = [`/${segment}`, `/${segment}/${id}`, "/sitemap.xml"];
  // 홈은 대표 메뉴와 선물세트 카드를 보여준다
  if (productType !== "reciprocate_item") paths.push("/");

  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: paths });
}
