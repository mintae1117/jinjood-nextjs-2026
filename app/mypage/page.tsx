"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiPackage, FiSettings, FiChevronRight, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/hooks";
import { Loading } from "@/components/common/Loading";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  background-color: #f8f8f8;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Inner = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 2rem;
`;

const ProfileCard = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f35525;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 2rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: #666666;
`;

const MenuSection = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafafa;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafafa;
  }
`;

const MenuIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${({ $color }) => $color || "#f0f0f0"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-right: 1rem;
  font-size: 1.25rem;
`;

const MenuText = styled.div`
  flex: 1;
`;

const MenuTitle = styled.span`
  display: block;
  font-weight: 500;
  color: #1e1e1e;
`;

const MenuDescription = styled.span`
  display: block;
  font-size: 0.8125rem;
  color: #999999;
  margin-top: 0.25rem;
`;

const MenuArrow = styled.div`
  color: #cccccc;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const PromptTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
`;

const PromptDescription = styled.p`
  color: #666666;
  margin-bottom: 1.5rem;
`;

const LoginButton = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  background-color: #f35525;
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d94820;
  }
`;

export default function MyPage() {
  const { user, isAuthenticated, isInitialized, signOut } = useAuth();
  const router = useRouter();

  if (!isInitialized) {
    return (
      <Container>
        <Inner>
          <Loading minHeight="400px" text="로딩 중..." />
        </Inner>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container>
        <Inner>
          <Title>마이페이지</Title>
          <LoginPrompt>
            <PromptTitle>로그인이 필요합니다</PromptTitle>
            <PromptDescription>
              마이페이지를 이용하시려면 로그인해주세요.
            </PromptDescription>
            <LoginButton href="/login?redirectTo=/mypage">로그인하기</LoginButton>
          </LoginPrompt>
        </Inner>
      </Container>
    );
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const getInitial = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <Container>
      <Inner>
        <Title>마이페이지</Title>

        <ProfileCard>
          <ProfileInfo>
            <Avatar>{getInitial()}</Avatar>
            <UserInfo>
              <UserName>{user.name || "회원"}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
          </ProfileInfo>
        </ProfileCard>

        <MenuSection>
          <MenuItem href="/mypage/orders">
            <MenuIcon $color="#4f46e5">
              <FiPackage />
            </MenuIcon>
            <MenuText>
              <MenuTitle>주문 내역</MenuTitle>
              <MenuDescription>주문 내역 및 배송 현황 확인</MenuDescription>
            </MenuText>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>

          <MenuItem href="/mypage/profile">
            <MenuIcon $color="#10b981">
              <FiUser />
            </MenuIcon>
            <MenuText>
              <MenuTitle>프로필 설정</MenuTitle>
              <MenuDescription>개인정보 및 연락처 수정</MenuDescription>
            </MenuText>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>

          <MenuItem href="/mypage/settings">
            <MenuIcon $color="#6b7280">
              <FiSettings />
            </MenuIcon>
            <MenuText>
              <MenuTitle>설정</MenuTitle>
              <MenuDescription>알림 및 기타 설정</MenuDescription>
            </MenuText>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>

          <MenuButton onClick={handleLogout}>
            <MenuIcon $color="#ef4444">
              <FiLogOut />
            </MenuIcon>
            <MenuText>
              <MenuTitle>로그아웃</MenuTitle>
              <MenuDescription>계정에서 로그아웃</MenuDescription>
            </MenuText>
          </MenuButton>
        </MenuSection>
      </Inner>
    </Container>
  );
}
