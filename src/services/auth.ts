import { createBrowserClient } from "@/lib/supabase";
import type { LoginFormData, RegisterFormData, User } from "@/types";

// Supabase Auth 사용자를 앱 User 타입으로 변환
function mapSupabaseUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  const metadata = supabaseUser.user_metadata || {};

  // 이름: name > full_name > nickname (카카오) 순으로 확인
  const name = (metadata.name as string) ||
               (metadata.full_name as string) ||
               (metadata.nickname as string) ||
               "";

  // 프로필 이미지: avatar_url > picture (구글) > profile_image (카카오) 순으로 확인
  const avatar_url = (metadata.avatar_url as string) ||
                     (metadata.picture as string) ||
                     (metadata.profile_image as string) ||
                     "";

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name,
    phone: (metadata.phone as string) || "",
    avatar_url,
  };
}

export const authService = {
  // 이메일/비밀번호 회원가입
  async signUp(data: RegisterFormData) {
    const supabase = createBrowserClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || "",
        },
      },
    });

    if (error) throw error;

    return authData.user ? mapSupabaseUser(authData.user) : null;
  },

  // 이메일/비밀번호 로그인
  async signIn(data: LoginFormData) {
    const supabase = createBrowserClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return authData.user ? mapSupabaseUser(authData.user) : null;
  },

  // 카카오 OAuth 로그인 (비즈앱: 이메일 포함)
  async signInWithKakao() {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "profile_nickname profile_image account_email",
      },
    });

    if (error) throw error;

    return data;
  },

  // 구글 OAuth 로그인
  async signInWithGoogle() {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
        },
      },
    });

    if (error) throw error;

    return data;
  },

  // 로그아웃
  async signOut() {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    return mapSupabaseUser(user);
  },

  // 세션 가져오기
  async getSession() {
    const supabase = createBrowserClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  },

  // 비밀번호 재설정 이메일 발송
  async resetPassword(email: string) {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  },

  // 비밀번호 업데이트
  async updatePassword(newPassword: string) {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // 사용자 프로필 업데이트
  async updateProfile(data: Partial<Pick<User, "name" | "phone" | "avatar_url">>) {
    const supabase = createBrowserClient();

    const { data: { user }, error } = await supabase.auth.updateUser({
      data: data,
    });

    if (error) throw error;

    return user ? mapSupabaseUser(user) : null;
  },

  // 프로필 이미지 업로드
  async uploadAvatar(userId: string, file: File) {
    const supabase = createBrowserClient();

    const ext = file.name.split(".").pop();
    const filePath = `avatars/${userId}.${ext}`;

    // 기존 파일 덮어쓰기 (upsert)
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    // 캐시 방지용 타임스탬프 추가
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    // user_metadata에 avatar_url 업데이트
    const { data: { user }, error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    if (updateError) throw updateError;

    return user ? mapSupabaseUser(user) : null;
  },

  // Auth 상태 변경 구독
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createBrowserClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          callback(mapSupabaseUser(session.user));
        } else {
          callback(null);
        }
      }
    );

    return subscription;
  },
};
