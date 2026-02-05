import { createClient } from "./client";

// 브라우저용 클라이언트 생성 함수
export { createClient as createBrowserClient } from "./client";

// 기존 코드 호환성을 위한 싱글톤 supabase 클라이언트
export const supabase = createClient();

// Supabase Storage bucket name
const STORAGE_BUCKET = "images";

// Placeholder 이미지 경로 (Supabase Storage 루트에 위치)
const PLACEHOLDER_PATH = "placeholder.png";

/**
 * Supabase Storage 이미지 URL 생성
 * @param path - 이미지 경로 (예: "menu/menu001.avif", "banners/banner001.jpeg")
 * @returns 전체 Supabase Storage URL
 *
 * DB에 저장된 경로가 이미 전체 URL이면 그대로 반환
 * 상대 경로면 Supabase Storage URL로 변환
 * 경로가 없거나 placeholder 관련 경로면 공통 placeholder 반환
 */
export function getStorageUrl(path: string | null | undefined): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // placeholder URL 생성 헬퍼
  const getPlaceholderUrl = () => {
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${PLACEHOLDER_PATH}`;
    }
    return "/images/placeholder.png";
  };

  // 경로가 없으면 placeholder 반환
  if (!path) return getPlaceholderUrl();

  // ready.png 또는 ready01.png 관련 경로는 placeholder로 통일
  if (path.includes("ready")) {
    return getPlaceholderUrl();
  }

  // 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 로컬 public 폴더 경로인 경우 (/images/...) 그대로 반환
  if (path.startsWith("/")) {
    return path;
  }

  // Supabase Storage URL 생성
  if (!supabaseUrl) {
    // fallback to local public folder
    return `/images/${path}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

// Legacy alias (backward compatibility)
export function getImageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
