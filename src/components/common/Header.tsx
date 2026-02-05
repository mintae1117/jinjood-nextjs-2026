"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { FiPhone, FiMail, FiMenu, FiX, FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { useAuth, useCart } from "@/hooks";
import UserDropdown from "@/components/auth/UserDropdown";
import SearchBar from "@/components/common/SearchBar";

const HeaderWrapper = styled.header<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #ffffff;
  box-shadow: ${({ $scrolled }) =>
    $scrolled ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none"};
  transition: box-shadow 0.3s ease;
`;

const SubHeader = styled.div<{ $scrolled: boolean }>`
  background-color: #f8f8f8;
  border-bottom: 1px solid #eeeeee;
  padding: ${({ $scrolled }) => ($scrolled ? "0" : "0.5rem 0")};
  font-size: 0.8125rem;
  max-height: ${({ $scrolled }) => ($scrolled ? "0" : "40px")};
  opacity: ${({ $scrolled }) => ($scrolled ? "0" : "1")};
  overflow: hidden;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SubHeaderContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666666;

    &:hover {
      color: #f35525;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  a {
    color: #666666;
    font-size: 1rem;

    &:hover {
      color: #f35525;
    }
  }
`;

const MainHeader = styled.div`
  background-color: #ffffff;
`;

const HeaderContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1e1e;
`;

const LogoImage = styled(Image)`
  height: 40px;
  width: auto;

  @media (max-width: 768px) {
    height: 36px;
  }
`;

const LogoText = styled.span`
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const MobileNav = styled.nav<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    position: fixed;
    top: 0;
    right: ${({ $isOpen }) => ($isOpen ? "0" : "-100%")};
    width: 80%;
    max-width: 400px;
    height: 100vh;
    background-color: #ffffff;
    flex-direction: column;
    justify-content: flex-start;
    padding: 5rem 2rem 2rem;
    gap: 1.5rem;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 1002;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? "#f35525" : "#1e1e1e")};
  position: relative;
  padding: 0.5rem 0;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${({ $active }) => ($active ? "100%" : "0")};
    height: 2px;
    background-color: #f35525;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #f35525;

    &::after {
      width: 100%;
    }
  }

  @media (max-width: 1024px) {
    font-size: 1.125rem;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid #eeeeee;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f35525;
  color: #ffffff;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d94820;
    transform: scale(1.05);
  }
`;

const CartButton = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  color: #1e1e1e;
  border: 1px solid #eeeeee;
  transition: all 0.3s ease;

  &:hover {
    border-color: #f35525;
    color: #f35525;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f35525;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 9px;
  padding: 0 4px;
`;

const LoginButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #1e1e1e;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #f35525;
    color: #f35525;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;

    span {
      display: none;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MenuButton = styled.button<{ $isOpen: boolean }>`
  display: none;
  font-size: 1.5rem;
  color: #1e1e1e;

  @media (max-width: 1024px) {
    display: ${({ $isOpen }) => ($isOpen ? "none" : "block")};
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 1024px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  color: #1e1e1e;
  display: none;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const HeaderSpacer = styled.div<{ $scrolled: boolean }>`
  height: ${({ $scrolled }) => ($scrolled ? "70px" : "110px")};
  transition: height 0.3s ease;

  @media (max-width: 768px) {
    height: 70px;
  }
`;

const navItems = [
  { href: "/", label: "홈" },
  { href: "/represent", label: "대표 메뉴" },
  { href: "/gifts", label: "선물 & 세트" },
  { href: "/reciprocate", label: "이바지 & 답례" },
  { href: "/contact", label: "오시는 길" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <HeaderWrapper $scrolled={isScrolled}>
        <SubHeader $scrolled={isScrolled}>
          <SubHeaderContainer>
            <ContactInfo>
              <a href="tel:051-621-5108">
                <FiPhone />
                <span>051-621-5108</span>
              </a>
              <a href="mailto:jea6922@naver.com">
                <FiMail />
                <span>jea6922@naver.com</span>
              </a>
            </ContactInfo>
            <SocialLinks>
              <a
                href="https://www.instagram.com/busan_jinjoods_rice_cake"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://pf.kakao.com/_zsKlb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kakao Channel"
              >
                <RiKakaoTalkFill />
              </a>
              <a
                href="https://band.us/band/77842984"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Naver Band"
              >
                <SiNaver />
              </a>
            </SocialLinks>
          </SubHeaderContainer>
        </SubHeader>

        <MainHeader>
          <HeaderContainer>
            <Logo href="/">
              <LogoImage
                src="/images/logo.png"
                alt="진주떡집 로고"
                width={40}
                height={40}
                priority
              />
              <LogoText>진주떡집</LogoText>
            </Logo>

            <DesktopNav>
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  $active={pathname === item.href}
                >
                  {item.label}
                </NavLink>
              ))}
            </DesktopNav>

            <HeaderActions>
              <SearchButton
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <FiSearch />
              </SearchButton>

              <CartButton href="/cart" aria-label="장바구니">
                <FiShoppingCart />
                {totalItems > 0 && <CartBadge>{totalItems > 99 ? "99+" : totalItems}</CartBadge>}
              </CartButton>

              {isInitialized && (
                isAuthenticated ? (
                  <UserDropdown />
                ) : (
                  <LoginButton href="/login">
                    <FiUser />
                    <span>로그인</span>
                  </LoginButton>
                )
              )}

              <MenuButton
                $isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <FiMenu />
              </MenuButton>
            </HeaderActions>
          </HeaderContainer>
        </MainHeader>
      </HeaderWrapper>

      <HeaderSpacer $scrolled={isScrolled} />

      <Overlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />

      <MobileNav $isOpen={isMobileMenuOpen}>
        <CloseButton onClick={closeMobileMenu} aria-label="Close menu">
          <FiX />
        </CloseButton>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            $active={pathname === item.href}
            onClick={closeMobileMenu}
          >
            {item.label}
          </NavLink>
        ))}
      </MobileNav>

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
