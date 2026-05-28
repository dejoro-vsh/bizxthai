"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import Link from "next/link";

export default function Dashboard() {
  const [liffLoaded, setLiffLoaded] = useState(false);
  const [profile, setProfile] = useState<{ displayName: string; userId: string; pictureUrl?: string } | null>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "MockLiffId";
    if (liffId === "MockLiffId") {
      setLiffLoaded(true);
      // Mock Profile for design preview
      setProfile({ displayName: "Nu Creator", userId: "U12345", pictureUrl: "https://i.pravatar.cc/150?img=11" });
      return;
    }

    liff.init({ liffId }).then(() => {
        setLiffLoaded(true);
        if (liff.isLoggedIn()) {
          liff.getProfile().then((p) => setProfile(p as any));
        }
      }).catch(console.error);
  }, []);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "20px" }}>
      {/* Header Area */}
      <div style={{ backgroundColor: "#ffffff", padding: "30px 20px 20px", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#1a1a1a", fontWeight: 700 }}>biz<span style={{color: "#00B900"}}>x</span>thai</h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>B2B Liquidity Ecosystem</p>
          </div>
          {profile?.pictureUrl && (
            <img src={profile.pictureUrl} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #00B900" }} />
          )}
        </div>

        {/* Balance Card */}
        <div style={{ background: "linear-gradient(135deg, #00B900 0%, #009900 100%)", borderRadius: "16px", padding: "24px", color: "white", boxShadow: "0 10px 20px rgba(0, 185, 0, 0.2)" }}>
          <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>ยอดคงเหลือ (Available Balance)</p>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "42px", fontWeight: 800, letterSpacing: "-1px" }}>0.00</h2>
            <span style={{ fontSize: "18px", marginLeft: "8px", fontWeight: 600 }}>BX</span>
          </div>
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.2)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", opacity: 0.9 }}>วงเงิน OD: 0.00 BX</span>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Normal Tier</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", padding: "24px 20px" }}>
        <button style={{ flex: 1, backgroundColor: "#ffffff", border: "1px solid #eee", padding: "16px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ width: 40, height: 40, backgroundColor: "#e6f8e6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#00B900", fontSize: "20px" }}>💸</div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>รับ/โอน BX</span>
        </button>
        <Link href="/marketplace" style={{ flex: 1, textDecoration: "none" }}>
          <button style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #eee", padding: "16px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ width: 40, height: 40, backgroundColor: "#e6f8e6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#00B900", fontSize: "20px" }}>🛍️</div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>ตลาด (Market)</span>
          </button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div style={{ padding: "0 20px" }}>
        <h3 style={{ fontSize: "16px", color: "#1a1a1a", marginBottom: "16px" }}>รายการล่าสุด</h3>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0", color: "#888", fontSize: "14px" }}>
            ยังไม่มีรายการเคลื่อนไหว
          </div>
        </div>
      </div>
    </div>
  );
}
