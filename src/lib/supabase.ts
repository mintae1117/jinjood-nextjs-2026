import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get public URL for images
export function getImageUrl(bucket: string, path: string): string {
  if (!supabaseUrl) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
