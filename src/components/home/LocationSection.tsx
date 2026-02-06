"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { FiPhone, FiMail, FiMapPin, FiClock, FiCreditCard } from "react-icons/fi";
import dynamic from "next/dynamic";
import { contactInfo } from "@/data/sampleData";

const KakaoMap = dynamic(() => import("@/components/common/KakaoMap"), {
  ssr: false,
});

const Section = styled.section`
  padding: 5rem 0;
  background-color: #f8f8f8;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionSubtitle = styled.span`
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f35525;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    height: 300px;
  }

`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoCard = styled(motion.div)`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: #f35525;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;

  h3 {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1e1e1e;
    margin-bottom: 0.375rem;
  }

  p {
    font-size: 0.875rem;
    color: #666666;
    line-height: 1.6;
  }

  a {
    color: #f35525;
    transition: color 0.2s ease;

    &:hover {
      color: #d94820;
    }
  }
`;

const BankCard = styled(motion.div)`
  padding: 1.25rem;
  background: linear-gradient(135deg, #1e1e1e 0%, #333333 100%);
  border-radius: 12px;
  color: #ffffff;
`;

const BankTitle = styled.h3`
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #f35525;
  }
`;

const BankNumber = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const BankDetails = styled.p`
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.7);
`;

export default function LocationSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
  };

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionSubtitle>Location</SectionSubtitle>
          <SectionTitle>오시는 길</SectionTitle>
        </SectionHeader>

        <ContentGrid>
          <MapWrapper>
            <KakaoMap
              lat={contactInfo.map_coordinates.lat}
              lng={contactInfo.map_coordinates.lng}
            />
          </MapWrapper>

          <InfoWrapper>
            <InfoCard variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
              <IconWrapper>
                <FiMapPin />
              </IconWrapper>
              <InfoContent>
                <h3>주소</h3>
                <p>{contactInfo.address}</p>
              </InfoContent>
            </InfoCard>

            <InfoCard variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
              <IconWrapper>
                <FiPhone />
              </IconWrapper>
              <InfoContent>
                <h3>전화번호</h3>
                <p>
                  매장: <a href={`tel:${contactInfo.phone.store}`}>{contactInfo.phone.store}</a>
                  <br />
                  휴대폰: <a href={`tel:${contactInfo.phone.mobile}`}>{contactInfo.phone.mobile}</a>
                </p>
              </InfoContent>
            </InfoCard>

            <InfoCard variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
              <IconWrapper>
                <FiClock />
              </IconWrapper>
              <InfoContent>
                <h3>영업시간</h3>
                <p>
                  월-금: {contactInfo.business_hours.weekday} / 토: {contactInfo.business_hours.saturday}
                  <br />
                  일요일: {contactInfo.business_hours.sunday}
                </p>
              </InfoContent>
            </InfoCard>

            <InfoCard variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
              <IconWrapper>
                <FiMail />
              </IconWrapper>
              <InfoContent>
                <h3>이메일</h3>
                <p>
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </p>
              </InfoContent>
            </InfoCard>

            <BankCard variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
              <BankTitle>
                <FiCreditCard />
                입금 계좌
              </BankTitle>
              <BankNumber>
                {contactInfo.bank_name} {contactInfo.bank_account}
              </BankNumber>
              <BankDetails>예금주: {contactInfo.account_holder}</BankDetails>
            </BankCard>
          </InfoWrapper>
        </ContentGrid>
      </Container>
    </Section>
  );
}
