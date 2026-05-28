"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

export default function Home() {
  const [liffLoaded, setLiffLoaded] = useState(false);
  const [profile, setProfile] = useState<{ displayName: string; userId: string; pictureUrl?: string } | null>(null);

  useEffect(() => {
    // กำหนด LIFF ID ภายหลังเมื่อพร้อม
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "MockLiffId";
    
    // สำหรับ Mock ตอนพัฒนายังไม่มี LIFF ID จริง
    if (liffId === "MockLiffId") {
      setLiffLoaded(true);
      return;
    }

    liff.init({ liffId })
      .then(() => {
        setLiffLoaded(true);
        if (liff.isLoggedIn()) {
          liff.getProfile().then((p) => {
            setProfile(p as any);
          });
        }
      })
      .catch((err) => {
        console.error("LIFF Init Error", err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <header className="text-center mb-2">
        <h1 style={{ color: "var(--primary-color)" }}>bizxthai</h1>
        <p className="text-secondary">B2B Liquidity Ecosystem</p>
      </header>

      <div className="card text-center mt-2">
        {profile ? (
          <div>
            {profile.pictureUrl && (
              <img 
                src={profile.pictureUrl} 
                alt="Profile" 
                style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: "10px" }}
              />
            )}
            <h2>สวัสดี, {profile.displayName}</h2>
          </div>
        ) : (
          <h2>ยินดีต้อนรับสู่ระบบ</h2>
        )}

        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          <p style={{ fontSize: "14px", color: "#166534" }}>ยอดคงเหลือ (BX Point)</p>
          <h1 style={{ fontSize: "36px", color: "#15803d", margin: "5px 0" }}>0.00</h1>
          <p style={{ fontSize: "12px", color: "#166534" }}>วงเงินเบิกเกินบัญชี (OD): -0.00 BX</p>
        </div>

        <button className="btn btn-primary mb-1">
          {liffLoaded && !profile && process.env.NEXT_PUBLIC_LIFF_ID ? "เข้าสู่ระบบด้วย LINE" : "สแกน QR / โอน BX"}
        </button>
        <button className="btn" style={{ backgroundColor: "#e2e8f0", color: "#475569" }}>
          กระดานซื้อขาย (Marketplace)
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "16px" }}>🔥 ข้อมูลบัญชีของคุณ</h3>
        <p style={{ fontSize: "14px", marginBottom: "8px" }}>ประเภทสมาชิก: <strong>Normal</strong></p>
        <p style={{ fontSize: "14px", marginBottom: "8px" }}>รหัสผู้แนะนำของคุณ: <strong>BX-1234</strong></p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          * แนะนำเพื่อนรับทันที 100 BX และรับค่าคอมมิชชันลึก 4 ชั้น!
        </p>
      </div>
    </div>
  );
}
