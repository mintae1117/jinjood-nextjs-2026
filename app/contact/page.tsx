"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiCreditCard,
} from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiNaver } from "react-icons/si";
import PageHeader from "@/components/common/PageHeader";
import { contactInfo, socialLinks } from "@/data/sampleData";

const Section = styled.section`
  padding: 4rem 0;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 2.5rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: #f35525;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
`;

const InfoCard = styled(motion.div)`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f8f8f8;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: #f35525;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e1e1e;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9375rem;
    color: #666666;
    line-height: 1.7;
  }

  a {
    color: #f35525;
    transition: color 0.3s ease;

    &:hover {
      color: #d94820;
    }
  }
`;

const MapSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;

  @media (max-width: 1024px) {
    min-height: 300px;
    flex: none;
    height: 300px;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const DirectionsButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DirectionsButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f35525;
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d94820;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const NaverButton = styled(DirectionsButton)`
  background-color: #03c75a;

  &:hover {
    background-color: #02a94d;
  }
`;

const KakaoButton = styled(DirectionsButton)`
  background-color: #fee500;
  color: #1e1e1e;

  &:hover {
    background-color: #e6cf00;
  }
`;

const SocialSection = styled.div`
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 1px solid #eeeeee;
`;

const SocialGrid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialButton = styled.a<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: ${({ $color }) => $color};
  color: #ffffff;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 640px) {
    flex: 1;
    min-width: calc(50% - 0.5rem);
    justify-content: center;
  }
`;

const BankInfoCard = styled(motion.div)`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1e1e1e 0%, #333333 100%);
  border-radius: 12px;
  color: #ffffff;
`;

const BankTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #f35525;
  }
`;

const BankNumber = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const BankDetails = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const CopyButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export default function ContactPage() {
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(contactInfo.bank_account);
    alert("계좌번호가 복사되었습니다.");
  };

  return (
    <>
      <PageHeader
        title="오시는 길"
        description="진주떡집을 방문해 주셔서 감사합니다. 아래 정보를 참고해 주세요."
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "오시는 길" }]}
      />

      <Section>
        <Container>
          <ContentGrid>
            <InfoSection>
              <SectionTitle>연락처 정보</SectionTitle>
              <InfoGrid>
                <InfoCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <IconWrapper>
                    <FiMapPin />
                  </IconWrapper>
                  <InfoContent>
                    <h3>주소</h3>
                    <p>{contactInfo.address}</p>
                  </InfoContent>
                </InfoCard>

                <InfoCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <IconWrapper>
                    <FiPhone />
                  </IconWrapper>
                  <InfoContent>
                    <h3>전화번호</h3>
                    <p>
                      매장:{" "}
                      <a href={`tel:${contactInfo.phone.store}`}>
                        {contactInfo.phone.store}
                      </a>
                      <br />
                      휴대폰:{" "}
                      <a href={`tel:${contactInfo.phone.mobile}`}>
                        {contactInfo.phone.mobile}
                      </a>
                      <br />
                      관리자:{" "}
                      <a href={`tel:${contactInfo.phone.admin}`}>
                        {contactInfo.phone.admin}
                      </a>
                    </p>
                  </InfoContent>
                </InfoCard>

                <InfoCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <IconWrapper>
                    <FiMail />
                  </IconWrapper>
                  <InfoContent>
                    <h3>이메일</h3>
                    <p>
                      <a href={`mailto:${contactInfo.email}`}>
                        {contactInfo.email}
                      </a>
                    </p>
                  </InfoContent>
                </InfoCard>

                <InfoCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <IconWrapper>
                    <FiClock />
                  </IconWrapper>
                  <InfoContent>
                    <h3>영업시간</h3>
                    <p>
                      월-금: {contactInfo.business_hours.weekday}
                      <br />
                      토요일: {contactInfo.business_hours.saturday}
                      <br />
                      일요일: {contactInfo.business_hours.sunday}
                    </p>
                    <p style={{ marginTop: "0.5rem", color: "#f35525" }}>
                      {contactInfo.call_hours}
                    </p>
                  </InfoContent>
                </InfoCard>
              </InfoGrid>

              <BankInfoCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <BankTitle>
                  <FiCreditCard />
                  입금 계좌
                </BankTitle>
                <BankNumber>
                  {contactInfo.bank_name} {contactInfo.bank_account}
                </BankNumber>
                <BankDetails>예금주: {contactInfo.account_holder}</BankDetails>
                <CopyButton onClick={handleCopyAccount}>
                  계좌번호 복사
                </CopyButton>
              </BankInfoCard>
            </InfoSection>

            <MapSection>
              <SectionTitle>지도</SectionTitle>
              <MapWrapper>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3262.7008587104706!2d129.1074524!3d35.1391379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3568ece455555555%3A0x51b13060777f1eba!2z7KeE7KO865ah7KeR!5e0!3m2!1sko!2skr!4v1770170342174!5m2!1sko!2skr"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </MapWrapper>
              <DirectionsButtons>
                <NaverButton
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(
                    contactInfo.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiNaver />
                  네이버 지도
                </NaverButton>
                <KakaoButton
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(
                    contactInfo.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RiKakaoTalkFill />
                  카카오맵
                </KakaoButton>
              </DirectionsButtons>
            </MapSection>
          </ContentGrid>

          <SocialSection>
            <SectionTitle>SNS</SectionTitle>
            <SocialGrid>
              <SocialButton
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                $color="#E1306C"
              >
                <FaInstagram />
                인스타그램
              </SocialButton>
              <SocialButton
                href={socialLinks.kakao_channel}
                target="_blank"
                rel="noopener noreferrer"
                $color="#FEE500"
                style={{ color: "#1e1e1e" }}
              >
                <RiKakaoTalkFill />
                카카오 채널
              </SocialButton>
              <SocialButton
                href={socialLinks.naver_band}
                target="_blank"
                rel="noopener noreferrer"
                $color="#03C75A"
              >
                <SiNaver />
                네이버 밴드
              </SocialButton>
            </SocialGrid>
          </SocialSection>
        </Container>
      </Section>
    </>
  );
}
