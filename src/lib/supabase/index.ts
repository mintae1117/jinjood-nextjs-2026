import { createClient } from "./client";

// 브라우저용 클라이언트 생성 함수
export { createClient as createBrowserClient } from "./client";

// 기존 코드 호환성을 위한 싱글톤 supabase 클라이언트
export const supabase = createClient();

// Helper function to get public URL for images
export function getImageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
