"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [liffLoaded, setLiffLoaded] = useState(false);
  const [profile, setProfile] = useState<{ displayName: string; userId: string; pictureUrl?: string } | null>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "MockLiffId";
    if (liffId === "MockLiffId") {
      setLiffLoaded(true);
      // Mock Profile for design preview
      setProfile({ displayName: session?.user?.name || "Nu Creator", userId: "U12345", pictureUrl: session?.user?.image || "https://i.pravatar.cc/150?img=11" });
      return;
    }

    liff.init({ liffId }).then(() => {
        setLiffLoaded(true);
        if (liff.isLoggedIn()) {
          liff.getProfile().then((p) => setProfile(p as any));
        }
      }).catch(console.error);
  }, [session]);

  const shortCode = (session?.user as any)?.shortCode || "test1";
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/go/${shortCode}` : `https://bizxthai.vercel.app/go/${shortCode}`;

  const handleShareLine = () => {
    if (liffLoaded && liff.isApiAvailable("shareTargetPicker")) {
      liff.shareTargetPicker([
        {
          type: "flex",
          altText: "🎉 รับแต้ม 100 BX ฟรีเมื่อสมัคร BizXThai",
          contents: {
            type: "bubble",
            hero: {
              type: "image",
              url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000&auto=format&fit=crop", // A nice placeholder image
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "BizXThai Platform",
                  weight: "bold",
                  size: "xl"
                },
                {
                  type: "text",
                  text: "แจกฟรี! 100 BX เพียงสมัครสมาชิกผ่านลิงก์นี้ และรับเงินคืน 5% ทุกการซื้อ",
                  margin: "md",
                  wrap: true,
                  color: "#666666"
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  height: "sm",
                  action: {
                    type: "uri",
                    label: "กดรับสิทธิ์เลย",
                    uri: inviteLink
                  },
                  color: "#00B900"
                }
              ],
              flex: 0
            }
          }
        }
      ]).then(() => {
        alert("ส่งคำเชิญเรียบร้อยแล้ว!");
      }).catch((err) => {
        console.error("ShareTargetPicker failed", err);
        alert("ไม่สามารถแชร์ได้ กรุณาก็อปปี้ลิงก์ไปส่งเองแทนนะครับ");
      });
    } else {
      // Fallback for normal browser
      window.open(`https://line.me/R/msg/text/?${encodeURIComponent("รับฟรี 100 BX ทันทีที่สมัคร BizXThai ผ่านลิงก์นี้! " + inviteLink)}`, "_blank");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("คัดลอกลิงก์เรียบร้อยแล้ว!");
  };

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

      {/* Invite Friends Section */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", border: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "20px" }}>🎁</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>ชวนเพื่อนรับแต้ม</h3>
          </div>
          <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#666" }}>รับคอมมิชชันส่วนต่างตลอดสายงาน สูงสุด 2.5% เมื่อเพื่อนที่สมัครซื้อสินค้า</p>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <div 
              style={{ flex: 1, backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {inviteLink}
            </div>
            <button onClick={copyToClipboard} style={{ backgroundColor: "#e5e7eb", border: "none", borderRadius: "8px", padding: "0 16px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
              Copy
            </button>
          </div>
          
          <button 
            onClick={handleShareLine}
            style={{ width: "100%", marginTop: "12px", backgroundColor: "#06C755", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            ส่งการ์ดคำเชิญผ่าน LINE
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px 20px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
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
        
        <Link href="/seller/dashboard" style={{ textDecoration: "none" }}>
          <button style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #eee", padding: "16px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ width: 32, height: 32, backgroundColor: "#fff8e6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59f00", fontSize: "16px" }}>🏪</div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>จัดการร้านค้า / ลงขายสินค้า</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
