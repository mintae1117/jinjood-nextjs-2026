'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeaderSection = styled.section<{ $backgroundImage?: string }>`
  position: relative;
  padding: 8rem 0 4rem;
  background-color: #1e1e1e;
  background-image: ${({ $backgroundImage }) =>
    $backgroundImage ? `url(${$backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  min-height: 300px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(30, 30, 30, 0.9) 0%,
      rgba(30, 30, 30, 0.7) 100%
    );
  }

  @media (max-width: 768px) {
    padding: 6rem 0 3rem;
    min-height: 250px;
  }
`;

const Container = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`;

const ContentWrapper = styled.div`
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 1.5rem;
  line-height: 1.8;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Breadcrumb = styled(motion.nav)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);

  a {
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.3s ease;

    &:hover {
      color: #f35525;
    }
  }

  span {
    color: #f35525;
  }
`;

const Separator = styled.span`
  color: rgba(255, 255, 255, 0.4);
`;

interface PageHeaderProps {
  title: string;
  description?: string;
  backgroundImage?: string;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
}

export default function PageHeader({
  title,
  description,
  backgroundImage,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <HeaderSection $backgroundImage={backgroundImage}>
      <Container>
        <ContentWrapper>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </Title>
          {description && (
            <Description
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {description}
            </Description>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {index > 0 && <Separator>/</Separator>}
                  {crumb.href ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </Breadcrumb>
          )}
        </ContentWrapper>
      </Container>
    </HeaderSection>
  );
}
