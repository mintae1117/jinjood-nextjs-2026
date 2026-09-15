"use client";

import styled from "styled-components";

/**
 * 가게 소개 섹션
 *
 * 홈의 유일한 <h1>을 담당한다. 배너·메뉴·선물세트는 useEffect로 데이터를 받아오기 때문에
 * 서버 렌더 시점에는 비어 있고, 크롤러(특히 JS를 실행하지 않는 네이버 Yeti)가 읽을 본문이
 * 남지 않는다. 이 섹션은 데이터 의존이 없어 첫 HTML에 그대로 실린다.
 * 문구는 지어내지 말 것 — 사업자 정보·영업시간·취급 품목 등 확인된 사실만 쓴다.
 */

const Section = styled.section`
  padding: 5rem 0;
  background-color: #f8f8f8;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;

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

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e1e1e;
  line-height: 1.35;
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 1.625rem;
  }
`;

const Body = styled.div`
  p {
    font-size: 1rem;
    line-height: 1.9;
    color: #666666;
    word-break: keep-all;

    & + p {
      margin-top: 1.25rem;
    }

    @media (max-width: 768px) {
      font-size: 0.9375rem;
      line-height: 1.8;
    }
  }

  strong {
    color: #1e1e1e;
    font-weight: 600;
  }
`;

const InfoList = styled.dl`
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.75rem 1rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid #eeeeee;
  font-size: 0.9375rem;
  line-height: 1.7;

  dt {
    font-weight: 600;
    color: #1e1e1e;
  }

  dd {
    color: #666666;
    word-break: keep-all;
  }

  a {
    color: #f35525;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;

    dd {
      margin-bottom: 0.75rem;
    }
  }
`;

export default function AboutSection() {
  return (
    <Section aria-labelledby="about-heading">
      <Container>
        <SectionHeader>
          <SectionSubtitle>About</SectionSubtitle>
          <Title id="about-heading">
            부산 수영구 남천동 떡집, 진주떡집
          </Title>
        </SectionHeader>

        <Body>
          <p>
            <strong>진주떡집</strong>은 1995년부터 부산 수영구 남천동에서 전통 떡을 만들어 온
            동네 떡집입니다. 황령대로481번길에 자리해 남천동은 물론 수영구 일대에서 찾아주시는
            단골 손님들과 30년 가까이 함께해 왔습니다.
          </p>
          <p>
            떡의 맛은 쌀에서 갈린다고 믿습니다. 해남 메뚜기 쌀을 비롯한 국내산 쌀을 쓰고,
            국내산 공주밤·가평 잣·진도 쑥·국내산 노란 콩처럼 재료 하나하나를 골라 씁니다.
            방부제를 넣지 않고 그날 쓸 만큼만 만들기 때문에, 갓 쪄낸 떡의 쫄깃한 식감을
            그대로 느끼실 수 있습니다.
          </p>
          <p>
            <strong>꿀백설기</strong>와 <strong>손송편</strong>, <strong>인절미</strong>,{" "}
            <strong>모둠떡(영양떡)</strong> 같은 대표 메뉴부터 <strong>약밥</strong>,{" "}
            <strong>가래떡</strong>, 겨울철 <strong>떡국떡</strong>까지 사계절 내내 준비합니다.
            집안 행사에는 <strong>이바지떡</strong>과 <strong>답례떡</strong>, 백일·돌 상차림,
            생신과 칠순을 위한 <strong>떡케이크</strong>를 규모와 예산에 맞춰 맞춤으로
            준비해 드립니다. 자세한 상담은 전화로 문의해 주세요.
          </p>
        </Body>

        <InfoList>
          <dt>주소</dt>
          <dd>부산광역시 수영구 황령대로481번길 10-3 (남천동)</dd>

          <dt>전화</dt>
          <dd>
            <a href="tel:051-621-5108">051-621-5108</a> · 통화 가능 시간 매일 오전 7시 ~ 오후 9시
          </dd>

          <dt>영업시간</dt>
          <dd>
            평일 오전 7시 ~ 오후 7시 / 토요일 오전 7시 ~ 오후 5시 / 일요일 정기휴무
          </dd>

          <dt>취급 품목</dt>
          <dd>
            백설기 · 인절미 · 송편 · 찹쌀떡 · 절편 · 가래떡 · 떡국떡 · 약밥 · 떡케이크 ·
            떡 선물세트 · 이바지떡 · 답례떡 · 백일떡 · 돌떡
          </dd>
        </InfoList>
      </Container>
    </Section>
  );
}
