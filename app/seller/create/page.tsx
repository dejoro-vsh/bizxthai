"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceTotal, setPriceTotal] = useState("");
  const [acceptCashPct, setAcceptCashPct] = useState(0);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isVip, setIsVip] = useState(true); // Mock toggle for demo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputFileRef.current?.files?.length) {
      alert("กรุณาอัปโหลดรูปภาพสินค้า");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload Image to Vercel Blob
      const file = inputFileRef.current.files[0];
      const uploadRes = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const blob = await uploadRes.json();
      
      if (!blob.url) throw new Error("Upload failed");

      // 2. Save Deal to DB
      const dealRes = await fetch("/api/deals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: "mock-seller-id", // Should be actual user UUID in production
          title,
          description,
          priceTotal: Number(priceTotal),
          acceptCashPct: isVip ? acceptCashPct : 0,
          imageUrl: blob.url
        })
      });

      const dealData = await dealRes.json();
      if (dealData.success) {
        alert("ลงสินค้าสำเร็จ!");
        router.push("/seller/dashboard");
      } else {
        throw new Error(dealData.error || "Failed to create deal");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px", paddingBottom: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <Link href="/seller/dashboard" style={{ textDecoration: "none", color: "#333", fontSize: "24px" }}>←</Link>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>ลงสินค้าใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Mock VIP Toggle for testing */}
        <div style={{ backgroundColor: isVip ? "#fff8e6" : "#f1f3f5", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: isVip ? "1px solid #ffd43b" : "1px solid #eee" }}>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>🌟 สถานะสมาชิก (ทดสอบ)</span>
          <select value={isVip ? "vip" : "normal"} onChange={(e) => setIsVip(e.target.value === "vip")} style={{ padding: "4px 8px", borderRadius: "4px" }}>
            <option value="normal">Normal (รับ BX 100%)</option>
            <option value="vip">VIP (รับเงินสดได้สูงสุด 50%)</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>รูปภาพสินค้า *</label>
          <input type="file" ref={inputFileRef} accept="image/*" required style={{ width: "100%", padding: "10px", border: "1px dashed #ccc", borderRadius: "8px", backgroundColor: "#fafafa" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>ชื่อสินค้า / บริการ *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="เช่น บริการทำความสะอาด 2 ชม." style={{ width: "100%", padding: "12px", border: "1px solid #eee", borderRadius: "8px", fontSize: "16px" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>รายละเอียด</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="อธิบายสินค้าของคุณ..." style={{ width: "100%", padding: "12px", border: "1px solid #eee", borderRadius: "8px", fontSize: "16px", fontFamily: "inherit" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>ราคารวม (บาท) *</label>
          <input type="number" value={priceTotal} onChange={(e) => setPriceTotal(e.target.value)} required min="1" placeholder="0" style={{ width: "100%", padding: "12px", border: "1px solid #eee", borderRadius: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ opacity: isVip ? 1 : 0.5, pointerEvents: isVip ? "auto" : "none" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>สัดส่วนการรับเงินสด (สำหรับ VIP เท่านั้น)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="10" 
              value={acceptCashPct} 
              onChange={(e) => setAcceptCashPct(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <strong style={{ minWidth: "60px", textAlign: "right" }}>{acceptCashPct}%</strong>
          </div>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
            รับเงินสด {acceptCashPct}% / รับแต้ม BX {100 - acceptCashPct}%
          </p>
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ marginTop: "16px" }}>
          {isLoading ? "กำลังอัปโหลด..." : "ลงขายสินค้า"}
        </button>
      </form>
    </div>
  );
}
