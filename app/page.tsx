"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Capture Referral Code from URL
    const ref = searchParams.get("ref");
    if (ref) {
      // Store ref code in cookie so the server-side NextAuth callback can read it
      document.cookie = `bizxthai_ref_code=${ref}; path=/; max-age=86400`; // 24 hours
      localStorage.setItem("bizxthai_ref_code", ref); // backup
    }
  }, [searchParams]);

  const handleLogin = () => {
    // Start NextAuth login flow
    signIn("line", { callbackUrl: "/dashboard" });
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "sans-serif", color: "#333" }}>
      {/* Navigation / Header */}
      <header style={{ 
        padding: "20px 24px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        zIndex: 100
      }}>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
          biz<span style={{ color: "#10B981" }}>x</span>thai
        </div>
        <button 
          onClick={handleLogin}
          style={{ 
            backgroundColor: "#10B981", 
            color: "white", 
            border: "none", 
            padding: "8px 20px", 
            borderRadius: "20px", 
            fontWeight: 600, 
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)"
          }}>
          เข้าสู่ระบบ
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#ECFDF5",
          color: "#059669",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: "24px"
        }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", backgroundColor: "#10B981", borderRadius: "50%" }}></span>
          ระบบเครือข่าย B2B ที่ทันสมัยที่สุด
        </div>
        
        <h1 style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.2, color: "#111827", marginBottom: "16px", letterSpacing: "-1px" }}>
          พลิกโฉมธุรกิจของคุณ<br/>ด้วย <span style={{ color: "#10B981" }}>Hybrid Commerce</span>
        </h1>
        
        <p style={{ fontSize: "16px", color: "#6B7280", lineHeight: 1.6, marginBottom: "40px" }}>
          เชื่อมต่อการซื้อขายแบบ B2B เข้ากับระบบ MLM อย่างไร้รอยต่อ สะสมยอด แลกเปลี่ยนสินค้า และสร้างรายได้แบบอัตโนมัติ โดยไม่ต้องรักษายอด
        </p>

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "40px", textAlign: "left" }}>
          <div style={{ backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "16px", border: "1px solid #F3F4F6", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ backgroundColor: "#D1FAE5", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              🛒
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>ซื้อขายคล่องตัว</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>รองรับการจ่ายเงินสดผสมแต้ม BX คืนกำไรให้ทุกคนทันที 5% ทุกการใช้จ่าย</p>
            </div>
          </div>

          <div style={{ backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "16px", border: "1px solid #F3F4F6", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ backgroundColor: "#DBEAFE", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              📈
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>ไม่ต้องรักษายอด</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>แค่ขยายสายงานและบริหารทีม ก็รับคอมมิชชันส่วนต่างได้สูงสุดถึง 2.5% ตลอดสาย</p>
            </div>
          </div>
          
          <div style={{ backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "16px", border: "1px solid #F3F4F6", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ backgroundColor: "#FEF3C7", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              ⚡
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>ระบบคำนวณอัตโนมัติ</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>รวบยอดคำนวณทุกวันที่ 31 ตัดรอบแม่นยำ โปร่งใส ตรวจสอบได้ทุกธุรกรรม</p>
            </div>
          </div>
        </div>

        {/* Big CTA */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>พร้อมเริ่มต้นธุรกิจหรือยัง?</h2>
          <button 
            onClick={handleLogin}
            style={{ 
              width: "100%",
              backgroundColor: "#06C755", // LINE Green
              color: "white", 
              border: "none", 
              padding: "16px", 
              borderRadius: "16px", 
              fontWeight: 700, 
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: "0 4px 12px rgba(6, 199, 85, 0.3)",
              transition: "transform 0.2s"
            }}>
            <span style={{ fontSize: "24px", backgroundColor: "white", color: "#06C755", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>L</span>
            เข้าสู่ระบบด้วย LINE
          </button>
          <p style={{ margin: "16px 0 0 0", fontSize: "13px", color: "#9CA3AF" }}>
            ระบบจะสร้างบัญชีและต่อสายงานให้อัตโนมัติ ไม่ต้องตั้งรหัสผ่าน
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "40px 20px", borderTop: "1px solid #f0f0f0", color: "#9CA3AF", fontSize: "14px" }}>
        © 2026 BizXThai Platform. All rights reserved.
      </footer>
    </div>
  );
}
