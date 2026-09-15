/**
 * JSON-LD 구조화 데이터를 <script>로 내보낸다.
 *
 * 서버 컴포넌트다("use client" 없음) — 레이아웃/페이지에서 그대로 렌더하면
 * 첫 HTML에 실리므로 JS를 실행하지 않는 크롤러도 읽는다.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
