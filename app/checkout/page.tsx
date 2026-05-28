"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import Link from "next/link";

// Make sure to call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  
  // Mock Deal details
  const dealPrice = 10000;
  const cashAmount = 5000;
  const bxAmount = 5000;
  const gatewayFee = cashAmount * 0.04;
  const totalCashToPay = cashAmount + gatewayFee;

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/payment/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cashAmount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const handleSuccess = async () => {
    setPaymentDone(true);
    // Call our internal backend to deduct BX and issue 5% Cashback
    await fetch("/api/payment/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId: "mock-buyer-id",
        sellerId: "mock-seller-id",
        cashAmount: cashAmount,
        bxAmount: bxAmount
      })
    });
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#00B900',
      colorBackground: '#ffffff',
      colorText: '#333333',
    },
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <Link href="/marketplace" style={{ textDecoration: "none", color: "#333", fontSize: "24px" }}>←</Link>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>ชำระเงิน (Checkout)</h1>
      </div>

      {!paymentDone ? (
        <>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>สรุปยอดคำสั่งซื้อ</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#666" }}>ยอดรวมสินค้า</span>
              <strong>{dealPrice.toLocaleString()} ฿</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#00B900" }}>ชำระด้วย BX Point (50%)</span>
              <strong style={{ color: "#00B900" }}>-{bxAmount.toLocaleString()} BX</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#666" }}>ส่วนที่ต้องชำระด้วยเงินสด (50%)</span>
              <strong>{cashAmount.toLocaleString()} ฿</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: "#666", fontSize: "14px" }}>ค่าธรรมเนียม Payment Gateway (4%)</span>
              <span style={{ fontSize: "14px" }}>{gatewayFee.toLocaleString()} ฿</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "12px" }}>
              <strong style={{ fontSize: "18px" }}>ยอดเงินสดสุทธิที่ต้องชำระ</strong>
              <strong style={{ fontSize: "20px", color: "#e11d48" }}>{totalCashToPay.toLocaleString()} ฿</strong>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>วิธีการชำระเงินสด</h3>
            {clientSecret ? (
              <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm amount={totalCashToPay} onSuccess={handleSuccess} />
              </Elements>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>กำลังโหลดระบบชำระเงิน...</div>
            )}
          </div>
        </>
      ) : (
        <div className="card text-center" style={{ padding: "40px 20px" }}>
          <div style={{ width: 60, height: 60, backgroundColor: "#e6f8e6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#00B900", fontSize: "30px", margin: "0 auto 20px" }}>✅</div>
          <h2 style={{ color: "#00B900", marginBottom: "12px" }}>ชำระเงินสำเร็จ!</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>ระบบได้ตัดแต้ม {bxAmount.toLocaleString()} BX และบันทึกการชำระเงินสดเรียบร้อยแล้ว</p>
          <Link href="/">
            <button className="btn btn-primary">กลับสู่หน้าหลัก</button>
          </Link>
        </div>
      )}
    </div>
  );
}
