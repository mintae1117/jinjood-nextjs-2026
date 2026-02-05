"use client";

import styled from "styled-components";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 2rem 1rem 4rem;
`;

const Inner = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666666;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #f35525;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const UpdateDate = styled.p`
  font-size: 0.875rem;
  color: #999999;
  margin-bottom: 2rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eeeeee;
`;

const Paragraph = styled.p`
  font-size: 0.9375rem;
  color: #444444;
  line-height: 1.8;
  margin-bottom: 1rem;
  word-break: keep-all;

  &:last-child {
    margin-bottom: 0;
  }
`;

const List = styled.ul`
  padding-left: 1.25rem;
  margin-bottom: 1rem;
`;

const ListItem = styled.li`
  font-size: 0.9375rem;
  color: #444444;
  line-height: 1.8;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export default function TermsContent() {
  return (
    <Container>
      <Inner>
        <BackLink href="/">
          <FiArrowLeft />
          홈으로 돌아가기
        </BackLink>

        <Title>이용약관</Title>
        <UpdateDate>시행일: 2024년 10월 3일</UpdateDate>

        <Section>
          <SectionTitle>제1조 (목적)</SectionTitle>
          <Paragraph>
            이 약관은 진주떡집(이하 &quot;회사&quot;)이 운영하는 온라인 쇼핑몰(이하 &quot;사이트&quot;)에서
            제공하는 서비스(이하 &quot;서비스&quot;)를 이용함에 있어 회사와 이용자의 권리, 의무 및
            책임사항을 규정함을 목적으로 합니다.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>제2조 (정의)</SectionTitle>
          <List>
            <ListItem>
              &quot;사이트&quot;란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등
              정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을
              말합니다.
            </ListItem>
            <ListItem>
              &quot;이용자&quot;란 사이트에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는
              회원 및 비회원을 말합니다.
            </ListItem>
            <ListItem>
              &quot;회원&quot;이란 사이트에 개인정보를 제공하여 회원등록을 한 자로서, 사이트의 정보를
              지속적으로 제공받으며, 사이트가 제공하는 서비스를 계속적으로 이용할 수 있는 자를
              말합니다.
            </ListItem>
            <ListItem>
              &quot;비회원&quot;이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를
              말합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제3조 (약관의 효력 및 변경)</SectionTitle>
          <List>
            <ListItem>
              이 약관은 사이트 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이
              발생합니다.
            </ListItem>
            <ListItem>
              회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
            </ListItem>
            <ListItem>
              회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께
              사이트의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제4조 (서비스의 제공 및 변경)</SectionTitle>
          <Paragraph>회사는 다음과 같은 서비스를 제공합니다.</Paragraph>
          <List>
            <ListItem>떡 및 관련 식품의 판매</ListItem>
            <ListItem>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</ListItem>
            <ListItem>구매계약이 체결된 재화 또는 용역의 배송</ListItem>
            <ListItem>기타 회사가 정하는 업무</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제5조 (서비스의 중단)</SectionTitle>
          <List>
            <ListItem>
              회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가
              발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
            </ListItem>
            <ListItem>
              회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는
              제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는
              경우에는 그러하지 아니합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제6조 (회원가입)</SectionTitle>
          <List>
            <ListItem>
              이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는
              의사표시를 함으로써 회원가입을 신청합니다.
            </ListItem>
            <ListItem>
              회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지
              않는 한 회원으로 등록합니다.
            </ListItem>
            <ListItem>
              가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
            </ListItem>
            <ListItem>등록 내용에 허위, 기재누락, 오기가 있는 경우</ListItem>
            <ListItem>
              기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제7조 (회원 탈퇴 및 자격 상실)</SectionTitle>
          <List>
            <ListItem>
              회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.
            </ListItem>
            <ListItem>
              회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수
              있습니다.
            </ListItem>
            <ListItem>가입 신청 시에 허위 내용을 등록한 경우</ListItem>
            <ListItem>
              사이트를 이용하여 구입한 재화 등의 대금, 기타 사이트 이용에 관련하여 회원이 부담하는
              채무를 기일에 지급하지 않는 경우
            </ListItem>
            <ListItem>
              다른 사람의 사이트 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는
              경우
            </ListItem>
            <ListItem>
              사이트를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제8조 (구매신청)</SectionTitle>
          <Paragraph>
            사이트 이용자는 사이트 상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며,
            회사는 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.
          </Paragraph>
          <List>
            <ListItem>재화 등의 검색 및 선택</ListItem>
            <ListItem>
              받는 사람의 성명, 주소, 전화번호(또는 휴대전화번호) 등의 입력
            </ListItem>
            <ListItem>
              약관내용, 청약철회권이 제한되는 서비스, 배송료 등의 비용부담과 관련한 내용에 대한 확인
            </ListItem>
            <ListItem>
              이 약관에 동의하고 위 사항을 확인하거나 거부하는 표시(예: 마우스 클릭)
            </ListItem>
            <ListItem>재화 등의 구매신청 및 이에 관한 확인 또는 회사의 확인에 대한 동의</ListItem>
            <ListItem>결제방법의 선택</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제9조 (결제방법)</SectionTitle>
          <Paragraph>
            사이트에서 구매한 재화 또는 용역에 대한 대금지급방법은 다음 각 호의 방법 중 가용한
            방법으로 할 수 있습니다.
          </Paragraph>
          <List>
            <ListItem>계좌이체</ListItem>
            <ListItem>신용카드 결제</ListItem>
            <ListItem>무통장입금</ListItem>
            <ListItem>기타 전자적 지급 방법에 의한 대금 지급 등</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제10조 (배송)</SectionTitle>
          <List>
            <ListItem>
              회사는 이용자가 구매한 재화에 대해 배송수단, 수단별 배송비용 부담자, 수단별 배송기간
              등을 명시합니다.
            </ListItem>
            <ListItem>
              떡류의 특성상 신선도 유지를 위해 당일 또는 익일 배송을 원칙으로 하며, 지역에 따라
              배송 소요시간이 달라질 수 있습니다.
            </ListItem>
            <ListItem>
              회사는 이용자가 구매한 재화에 대해 배송수단, 수단별 배송비용 부담자, 수단별 배송기간
              등을 명시합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제11조 (환불 및 교환)</SectionTitle>
          <List>
            <ListItem>
              떡류는 신선식품의 특성상 단순 변심에 의한 교환 및 환불이 어렵습니다.
            </ListItem>
            <ListItem>
              다만, 상품 하자 또는 오배송의 경우 수령 후 24시간 이내에 고객센터로 연락주시면
              교환 또는 환불 처리해 드립니다.
            </ListItem>
            <ListItem>
              교환 또는 환불 요청 시 상품의 상태를 확인할 수 있는 사진을 함께 보내주셔야 합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제12조 (개인정보보호)</SectionTitle>
          <Paragraph>
            회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다.
            자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>제13조 (분쟁해결)</SectionTitle>
          <List>
            <ListItem>
              회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기
              위하여 피해보상처리기구를 설치, 운영합니다.
            </ListItem>
            <ListItem>
              회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에
              의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만,
              제소 당시 이용자의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는
              민사소송법상의 관할법원에 제기합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>부칙</SectionTitle>
          <Paragraph>이 약관은 2024년 10월 3일부터 적용됩니다.</Paragraph>
        </Section>
      </Inner>
    </Container>
  );
}
