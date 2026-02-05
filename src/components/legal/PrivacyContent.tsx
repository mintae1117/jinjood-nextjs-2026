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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.875rem;

  th,
  td {
    border: 1px solid #eeeeee;
    padding: 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: #f8f8f8;
    font-weight: 600;
    color: #1e1e1e;
    white-space: nowrap;
  }

  td {
    color: #444444;
  }

  @media (max-width: 768px) {
    font-size: 0.8125rem;

    th,
    td {
      padding: 0.5rem;
    }
  }
`;

const InfoBox = styled.div`
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;

  p {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export default function PrivacyContent() {
  return (
    <Container>
      <Inner>
        <BackLink href="/">
          <FiArrowLeft />
          홈으로 돌아가기
        </BackLink>

        <Title>개인정보처리방침</Title>
        <UpdateDate>시행일: 2026년 3월 1일</UpdateDate>

        <Paragraph>
          진주떡집(이하 &quot;회사&quot;)은 개인정보보호법 등 관련 법령상의 개인정보보호 규정을
          준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 이용자의 권익 보호에 최선을
          다하고 있습니다.
        </Paragraph>

        <Section>
          <SectionTitle>제1조 (개인정보의 수집 및 이용 목적)</SectionTitle>
          <Paragraph>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</Paragraph>
          <List>
            <ListItem>
              <strong>회원 가입 및 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인식별,
              불량회원의 부정 이용 방지와 비인가 사용 방지, 가입의사 확인, 연령확인, 불만처리 등
              민원처리, 고지사항 전달
            </ListItem>
            <ListItem>
              <strong>재화 또는 서비스 제공:</strong> 물품배송, 서비스 제공, 계약서·청구서 발송,
              콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금결제·정산
            </ListItem>
            <ListItem>
              <strong>마케팅 및 광고에의 활용:</strong> 신규 서비스(제품) 개발 및 특화, 이벤트 등
              광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악
              또는 회원의 서비스 이용에 대한 통계
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제2조 (수집하는 개인정보의 항목)</SectionTitle>
          <Paragraph>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</Paragraph>
          <Table>
            <thead>
              <tr>
                <th>구분</th>
                <th>수집 항목</th>
                <th>수집 시점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>필수항목</td>
                <td>이메일, 비밀번호, 이름</td>
                <td>회원가입 시</td>
              </tr>
              <tr>
                <td>선택항목</td>
                <td>연락처, 프로필 이미지</td>
                <td>회원가입 시</td>
              </tr>
              <tr>
                <td>소셜 로그인</td>
                <td>
                  이메일, 이름, 프로필 이미지 (카카오, 구글 등 소셜 서비스 제공 정보)
                </td>
                <td>소셜 로그인 시</td>
              </tr>
              <tr>
                <td>주문 시</td>
                <td>수령인 이름, 배송지 주소, 연락처</td>
                <td>상품 주문 시</td>
              </tr>
              <tr>
                <td>자동 수집</td>
                <td>IP주소, 쿠키, 방문일시, 서비스 이용기록</td>
                <td>서비스 이용 시</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>제3조 (개인정보의 보유 및 이용기간)</SectionTitle>
          <Paragraph>
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이
            파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 관계법령에서
            정한 일정한 기간 동안 개인정보를 보관합니다.
          </Paragraph>
          <Table>
            <thead>
              <tr>
                <th>보존 항목</th>
                <th>보존 근거</th>
                <th>보존 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>계약 또는 청약철회 등에 관한 기록</td>
                <td>전자상거래 등에서의 소비자보호에 관한 법률</td>
                <td>5년</td>
              </tr>
              <tr>
                <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                <td>전자상거래 등에서의 소비자보호에 관한 법률</td>
                <td>5년</td>
              </tr>
              <tr>
                <td>소비자의 불만 또는 분쟁처리에 관한 기록</td>
                <td>전자상거래 등에서의 소비자보호에 관한 법률</td>
                <td>3년</td>
              </tr>
              <tr>
                <td>웹사이트 방문기록</td>
                <td>통신비밀보호법</td>
                <td>3개월</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>제4조 (개인정보의 제3자 제공)</SectionTitle>
          <Paragraph>
            회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 목적 범위 내에서 처리하며,
            이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지
            않습니다. 단, 다음의 경우에는 예외로 합니다.
          </Paragraph>
          <List>
            <ListItem>이용자가 사전에 제3자 제공에 동의한 경우</ListItem>
            <ListItem>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제5조 (개인정보처리의 위탁)</SectionTitle>
          <Paragraph>
            회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고
            있습니다.
          </Paragraph>
          <Table>
            <thead>
              <tr>
                <th>수탁업체</th>
                <th>위탁업무 내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>배송업체 (택배사)</td>
                <td>상품 배송</td>
              </tr>
              <tr>
                <td>결제대행사</td>
                <td>결제 처리 및 결제 도용 방지</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>제6조 (정보주체의 권리·의무 및 행사방법)</SectionTitle>
          <Paragraph>
            이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
          </Paragraph>
          <List>
            <ListItem>개인정보 열람 요구</ListItem>
            <ListItem>오류 등이 있을 경우 정정 요구</ListItem>
            <ListItem>삭제 요구</ListItem>
            <ListItem>처리정지 요구</ListItem>
          </List>
          <Paragraph>
            위 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며,
            회사는 이에 대해 지체 없이 조치하겠습니다.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>제7조 (개인정보의 파기)</SectionTitle>
          <Paragraph>
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
            지체 없이 해당 개인정보를 파기합니다.
          </Paragraph>
          <List>
            <ListItem>
              <strong>파기절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져
              내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
            </ListItem>
            <ListItem>
              <strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적
              방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여
              파기합니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제8조 (개인정보의 안전성 확보 조치)</SectionTitle>
          <Paragraph>
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
          </Paragraph>
          <List>
            <ListItem>
              <strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육 등
            </ListItem>
            <ListItem>
              <strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템
              설치, 고유식별정보 등의 암호화, 보안프로그램 설치
            </ListItem>
            <ListItem>
              <strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제9조 (쿠키의 사용)</SectionTitle>
          <Paragraph>
            회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로
            불러오는 &apos;쿠키(cookie)&apos;를 사용합니다.
          </Paragraph>
          <List>
            <ListItem>
              <strong>쿠키의 사용 목적:</strong> 이용자가 방문한 각 서비스와 웹 사이트들에 대한
              방문 및 이용형태, 인기 검색어, 보안접속 여부 등을 파악하여 이용자에게 최적화된 정보
              제공을 위해 사용됩니다.
            </ListItem>
            <ListItem>
              <strong>쿠키의 설치·운영 및 거부:</strong> 웹브라우저 상단의 도구 &gt; 인터넷 옵션
              &gt; 개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다. 쿠키 저장을
              거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제10조 (개인정보 보호책임자)</SectionTitle>
          <Paragraph>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
            불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </Paragraph>
          <InfoBox>
            <Paragraph>
              <strong>개인정보 보호책임자</strong>
            </Paragraph>
            <Paragraph>성명: 조장현</Paragraph>
            <Paragraph>직책: 대표</Paragraph>
            <Paragraph>연락처: 051-621-5108</Paragraph>
            <Paragraph>이메일: jea6922@naver.com</Paragraph>
          </InfoBox>
          <Paragraph>
            정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의,
            불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
            회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>제11조 (권익침해 구제방법)</SectionTitle>
          <Paragraph>
            정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
            한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
          </Paragraph>
          <List>
            <ListItem>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</ListItem>
            <ListItem>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</ListItem>
            <ListItem>대검찰청: (국번없이) 1301 (www.spo.go.kr)</ListItem>
            <ListItem>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>제12조 (개인정보처리방침의 변경)</SectionTitle>
          <Paragraph>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제
            및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>부칙</SectionTitle>
          <Paragraph>이 개인정보처리방침은 2026년 3월 1일부터 적용됩니다.</Paragraph>
        </Section>
      </Inner>
    </Container>
  );
}
