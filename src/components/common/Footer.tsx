"use client";

import Link from "next/link";
import styled from "styled-components";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import { contactInfo, socialLinks } from "@/data/sampleData";

const FooterWrapper = styled.footer`
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 2.5rem 0 1.5rem;
`;

const FooterContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  h3 {
    display: inline-block;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #ffffff;
    position: relative;
    padding-bottom: 0.5rem;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #f35525;
    }
  }
`;

const FooterLogo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ffffff;
`;

const FooterDescription = styled.p`
  color: #999999;
  font-size: 0.8125rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 0.75rem;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f35525;
      transform: translateY(-2px);
    }
  }
`;

const FooterLinks = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li a {
    color: #999999;
    font-size: 0.8125rem;
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
  gap: 0.625rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    color: #999999;
    font-size: 0.8125rem;

    svg {
      color: #f35525;
      font-size: 0.9375rem;
      margin-top: 0.125rem;
      flex-shrink: 0;
    }

    span {
      line-height: 1.5;
    }

    a {
      color: #999999;
      transition: color 0.2s ease;

      &:hover {
        color: #f35525;
      }
    }
  }
`;

const FooterBottom = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const BusinessInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #666666;
  line-height: 1.6;

  span {
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.125rem;
    text-align: center;
  }
`;

const SiteInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #666666;

  a {
    color: #f35525;
    transition: color 0.2s ease;

    &:hover {
      color: #ff7a52;
    }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.125rem;
    text-align: center;
  }
`;

const CopyrightRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #666666;
  font-size: 0.75rem;
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 1rem;

  a {
    color: #666666;
    font-size: 0.75rem;
    transition: color 0.3s ease;

    &:hover {
      color: #f35525;
    }
  }
`;

export default function Footer() {
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
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href={socialLinks.kakao_channel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kakao Channel"
              >
                <RiKakaoTalkFill />
              </a>
              <a
                href={socialLinks.naver_band}
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
                  월-금: {contactInfo.business_hours.weekday}
                  <br />
                  토요일: {contactInfo.business_hours.saturday}
                  <br />
                  일요일: {contactInfo.business_hours.sunday}
                </span>
              </li>
              <li>
                <FiPhone />
                <span>{contactInfo.call_hours}</span>
              </li>
            </ContactList>
          </FooterSection>

          <FooterSection>
            <h3>연락처</h3>
            <ContactList>
              <li>
                <FiMapPin />
                <span>{contactInfo.address}</span>
              </li>
              <li>
                <FiPhone />
                <span>
                  매장: <a href={`tel:${contactInfo.phone.store}`}>{contactInfo.phone.store}</a>
                  <br />
                  휴대폰: <a href={`tel:${contactInfo.phone.mobile}`}>{contactInfo.phone.mobile}</a>
                  <br />
                  관리자: <a href={`tel:${contactInfo.phone.admin}`}>{contactInfo.phone.admin}</a>
                </span>
              </li>
              <li>
                <FiMail />
                <span>
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </span>
              </li>
            </ContactList>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <BusinessInfo>
            <span>사업자등록번호: {contactInfo.business_number}</span>
            <span>대표: {contactInfo.representative}</span>
            <span>팩스: {contactInfo.fax}</span>
            <span>입금계좌: {contactInfo.bank_name} {contactInfo.bank_account} (예금주: {contactInfo.account_holder})</span>
          </BusinessInfo>

          <SiteInfo>
            <span>
              Developer:{" "}
              <a
                href={contactInfo.developer.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contactInfo.developer.name}
              </a>
            </span>
            <span>사이트 관리자: {contactInfo.site_admin.name}</span>
            <span>관리자 번호: {contactInfo.site_admin.phone}</span>
          </SiteInfo>

          <CopyrightRow>
            <Copyright>
              Copyright &copy; jinjood.com All rights reserved.
            </Copyright>
            <FooterBottomLinks>
              <a href="#">이용약관</a>
              <a href="#">개인정보처리방침</a>
            </FooterBottomLinks>
          </CopyrightRow>
        </FooterBottom>
      </FooterContainer>
    </FooterWrapper>
  );
}
