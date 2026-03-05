"use client";

import styled from "styled-components";
import Link from "next/link";
import { useCart } from "@/hooks";


const SummaryWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 120px;

  @media (max-width: 1024px) {
    position: static;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eeeeee;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
`;

const SummaryLabel = styled.span`
  color: #666666;
`;

const SummaryValue = styled.span`
  color: #1e1e1e;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #eeeeee;
  margin: 1rem 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const TotalLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1e1e1e;
`;

const TotalValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f35525;
`;

const CheckoutButton = styled.button`
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background-color: #cccccc;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  border-radius: 12px;
  border: none;
  cursor: pointer;
`;

const ContinueShopping = styled(Link)`
  display: block;
  width: 100%;
  padding: 0.875rem;
  margin-top: 0.75rem;
  background-color: transparent;
  color: #666666;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid #eeeeee;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #f35525;
    color: #f35525;
  }
`;

const Notice = styled.p`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eeeeee;
  font-size: 0.75rem;
  color: #999999;
  line-height: 1.5;
`;

const DELIVERY_FEE = 3000;

export default function CartSummary() {
  const { totalPrice, totalItems } = useCart();

  const finalTotal = totalPrice + DELIVERY_FEE;

  const handleCheckoutClick = () => {
    alert("결제 기능은 아직 준비중입니다. 전화 주문을 이용해 주세요. (051-621-5108)");
  };

  return (
    <SummaryWrapper>
      <Title>주문 요약</Title>

      <SummaryRow>
        <SummaryLabel>상품 수량</SummaryLabel>
        <SummaryValue>{totalItems}개</SummaryValue>
      </SummaryRow>

      <SummaryRow>
        <SummaryLabel>상품 금액</SummaryLabel>
        <SummaryValue>{totalPrice.toLocaleString("ko-KR")}원</SummaryValue>
      </SummaryRow>

      <SummaryRow>
        <SummaryLabel>배송비</SummaryLabel>
        <SummaryValue>{DELIVERY_FEE.toLocaleString("ko-KR")}원</SummaryValue>
      </SummaryRow>

      <Divider />

      <TotalRow>
        <TotalLabel>총 결제금액</TotalLabel>
        <TotalValue>{finalTotal.toLocaleString("ko-KR")}원</TotalValue>
      </TotalRow>

      <CheckoutButton onClick={handleCheckoutClick}>주문하기</CheckoutButton>
      <ContinueShopping href="/represent">계속 쇼핑하기</ContinueShopping>

      <Notice>
        * 배송비 {DELIVERY_FEE.toLocaleString("ko-KR")}원이 별도로 부과됩니다.
        <br />
        * 결제 기능 준비중입니다. 전화 주문: 051-621-5108
      </Notice>
    </SummaryWrapper>
  );
}
