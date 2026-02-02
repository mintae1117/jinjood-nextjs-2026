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

const CheckoutButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background-color: #f35525;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  border-radius: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d94820;
  }
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
const FREE_DELIVERY_THRESHOLD = 50000;

export default function CartSummary() {
  const { totalPrice, totalItems } = useCart();

  const isDeliveryFree = totalPrice >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isDeliveryFree ? 0 : DELIVERY_FEE;
  const finalTotal = totalPrice + deliveryFee;

  const amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - totalPrice;

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
        <SummaryValue>
          {isDeliveryFree ? (
            <span style={{ color: "#16a34a" }}>무료</span>
          ) : (
            `${deliveryFee.toLocaleString("ko-KR")}원`
          )}
        </SummaryValue>
      </SummaryRow>

      {!isDeliveryFree && amountForFreeDelivery > 0 && (
        <SummaryRow>
          <SummaryLabel style={{ fontSize: "0.75rem", color: "#f35525" }}>
            {amountForFreeDelivery.toLocaleString("ko-KR")}원 더 담으면 무료배송!
          </SummaryLabel>
        </SummaryRow>
      )}

      <Divider />

      <TotalRow>
        <TotalLabel>총 결제금액</TotalLabel>
        <TotalValue>{finalTotal.toLocaleString("ko-KR")}원</TotalValue>
      </TotalRow>

      <CheckoutButton href="/checkout">주문하기</CheckoutButton>
      <ContinueShopping href="/represent">계속 쇼핑하기</ContinueShopping>

      <Notice>
        * 배송비는 {FREE_DELIVERY_THRESHOLD.toLocaleString("ko-KR")}원 이상 구매 시 무료입니다.
        <br />
        * 실제 결제 금액은 결제 단계에서 확인하실 수 있습니다.
      </Notice>
    </SummaryWrapper>
  );
}
