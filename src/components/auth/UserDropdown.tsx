"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { FiUser, FiShoppingBag, FiHeart, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useAuth } from "@/hooks";

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #f35525;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f35525;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
`;

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1e1e;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ChevronIcon = styled(FiChevronDown)<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0)")};
  color: #666666;

  @media (max-width: 768px) {
    display: none;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transform: ${({ $isOpen }) => ($isOpen ? "translateY(0)" : "translateY(-10px)")};
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
`;

const MenuHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eeeeee;
`;

const MenuUserName = styled.div`
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.25rem;
`;

const MenuUserEmail = styled.div`
  font-size: 0.75rem;
  color: #666666;
`;

const MenuList = styled.div`
  padding: 0.5rem 0;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #1e1e1e;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f8f8;
  }

  svg {
    font-size: 1.125rem;
    color: #666666;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background-color: #eeeeee;
  margin: 0.5rem 0;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  color: #dc2626;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;

  &:hover {
    background-color: #fef2f2;
  }

  svg {
    font-size: 1.125rem;
  }
`;

export default function UserDropdown() {
  const { user, signOut, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  const displayName = user.name || user.email?.split("@")[0] || "사용자";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownTrigger onClick={() => setIsOpen(!isOpen)}>
        <Avatar>{initials}</Avatar>
        <UserName>{displayName}</UserName>
        <ChevronIcon $isOpen={isOpen} />
      </DropdownTrigger>

      <DropdownMenu $isOpen={isOpen}>
        <MenuHeader>
          <MenuUserName>{displayName}</MenuUserName>
          <MenuUserEmail>{user.email}</MenuUserEmail>
        </MenuHeader>

        <MenuList>
          <MenuItem href="/mypage" onClick={() => setIsOpen(false)}>
            <FiUser />
            마이페이지
          </MenuItem>
          <MenuItem href="/mypage/orders" onClick={() => setIsOpen(false)}>
            <FiShoppingBag />
            주문 내역
          </MenuItem>
          <MenuItem href="/mypage/wishlist" onClick={() => setIsOpen(false)}>
            <FiHeart />
            위시리스트
          </MenuItem>
          <MenuItem href="/mypage/settings" onClick={() => setIsOpen(false)}>
            <FiSettings />
            설정
          </MenuItem>
        </MenuList>

        <MenuDivider />

        <LogoutButton onClick={handleLogout} disabled={isLoading}>
          <FiLogOut />
          {isLoading ? "로그아웃 중..." : "로그아웃"}
        </LogoutButton>
      </DropdownMenu>
    </DropdownContainer>
  );
}
