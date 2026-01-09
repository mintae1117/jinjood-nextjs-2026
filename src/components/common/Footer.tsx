"use client";

import Link from "next/link";
import styled from "styled-components";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";

const FooterWrapper = styled.footer`
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 4rem 0 2rem;
`;

const FooterContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #ffffff;
    position: relative;
    padding-bottom: 0.75rem;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 2px;
      background-color: #f35525;
    }
  }
`;

const FooterLogo = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
`;

const FooterDescription = styled.p`
  color: #999999;
  font-size: 0.875rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 1.125rem;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f35525;
      transform: translateY(-3px);
    }
  }
`;

const FooterLinks = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li a {
    color: #999999;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      color: #f35525;
      padding-left: 5px;
    }
  }
`;

const ContactList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    color: #999999;
    font-size: 0.875rem;

    svg {
      color: #f35525;
      font-size: 1.125rem;
      margin-top: 0.125rem;
      flex-shrink: 0;
    }

    span {
      line-height: 1.6;
    }
  }
`;

const FooterBottom = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #666666;
  font-size: 0.875rem;
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  a {
    color: #666666;
    font-size: 0.875rem;
    transition: color 0.3s ease;

    &:hover {
      color: #f35525;
    }
  }
`;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <FooterContainer>
        <FooterGrid>
          <FooterSection>
            <FooterLogo>진주떡집</FooterLogo>
            <FooterDescription>
              1995년부터 전통의 맛을 지켜온 진주떡집입니다. 정성을 담아 만든
              신선한 떡으로 특별한 순간을 더욱 빛나게 해드립니다.
            </FooterDescription>
            <SocialIcons>
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
            </SocialIcons>
          </FooterSection>

          <FooterSection>
            <h3>바로가기</h3>
            <FooterLinks>
              <li>
                <Link href="/">홈</Link>
              </li>
              <li>
                <Link href="/represent">대표 메뉴</Link>
              </li>
              <li>
                <Link href="/gifts">선물 & 세트</Link>
              </li>
              <li>
                <Link href="/reciprocate">이바지 & 답례</Link>
              </li>
              <li>
                <Link href="/contact">오시는 길</Link>
              </li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>영업시간</h3>
            <ContactList>
              <li>
                <FiClock />
                <span>
                  월-금: 오전 7시 - 오후 7시
                  <br />
                  토요일: 오전 7시 - 오후 5시
                  <br />
                  일요일: 휴무
                </span>
              </li>
            </ContactList>
          </FooterSection>

          <FooterSection>
            <h3>연락처</h3>
            <ContactList>
              <li>
                <FiMapPin />
                <span>부산광역시 수영구 황령대로 481번길 10-3</span>
              </li>
              <li>
                <FiPhone />
                <span>
                  매장: 051-621-5108
                  <br />
                  휴대폰: 010-4728-6922
                </span>
              </li>
              <li>
                <FiMail />
                <span>jea6922@naver.com</span>
              </li>
            </ContactList>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            &copy; {currentYear} 진주떡집. All rights reserved.
          </Copyright>
          <FooterBottomLinks>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
          </FooterBottomLinks>
        </FooterBottom>
      </FooterContainer>
    </FooterWrapper>
  );
}
