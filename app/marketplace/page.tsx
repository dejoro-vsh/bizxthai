import Link from "next/link";
import { sql } from "@vercel/postgres";

export const dynamic = 'force-dynamic';

export default async function Marketplace() {
  // Fetch deals and join with users to get seller name
  const { rows: deals } = await sql`
    SELECT d.id, d.title, d.price_total, d.accept_cash_pct, d.image_url, d.created_at, u.display_name as seller_name 
    FROM idle_deals d
    LEFT JOIN users u ON d.seller_id = u.id
    WHERE d.status = 'open'
    ORDER BY d.created_at DESC
  `;

  // Provide fallback mock data if DB is empty to keep UI looking good during demo
  const displayDeals = deals.length > 0 ? deals.map(d => ({
    id: d.id,
    sellerName: d.seller_name || "Unknown Seller",
    avatar: "https://i.pravatar.cc/150?img=" + (Math.floor(Math.random() * 50) + 1), // Random mock avatar
    title: d.title,
    image: d.image_url || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800",
    totalPrice: Number(d.price_total),
    paymentType: Number(d.accept_cash_pct) === 0 ? "bx_only" : "hybrid",
    time: "ล่าสุด"
  })) : [
    {
      id: "mock1",
      sellerName: "SuperPrint Co.,Ltd",
      avatar: "https://i.pravatar.cc/150?img=33",
      title: "บริการพิมพ์บรรจุภัณฑ์และฉลากสินค้า (ว่าง 2 คิว)",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
      totalPrice: 20000,
      paymentType: "hybrid",
      time: "2 ชม. ที่แล้ว"
    }
  ];

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#ffffff", padding: "16px 20px", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #eaeaea", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#333", fontSize: "24px" }}>←</Link>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Marketplace</h1>
      </div>

      {/* Feed Area */}
      <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
        {displayDeals.map((deal) => (
          <div key={deal.id} style={{ backgroundColor: "#ffffff", padding: "16px", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
            
            {/* Post Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <img src={deal.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #eee" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{deal.sellerName}</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{deal.time}</p>
              </div>
            </div>

            {/* Post Content */}
            <h2 style={{ fontSize: "16px", margin: "0 0 12px 0", color: "#333", lineHeight: 1.4 }}>{deal.title}</h2>
            
            {/* Large Image */}
            <div style={{ width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", backgroundColor: "#f5f5f5" }}>
              <img src={deal.image} alt="deal image" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Pricing & Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>ราคาสุทธิ</p>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#00B900" }}>
                  {deal.totalPrice.toLocaleString()} ฿
                </h3>
              </div>
              
              {/* Payment Type Badge */}
              <div style={{ padding: "6px 12px", borderRadius: "8px", fontWeight: 600, fontSize: "12px",
                backgroundColor: deal.paymentType === "bx_only" ? "#e6f8e6" : "#fff1f2",
                color: deal.paymentType === "bx_only" ? "#00B900" : "#e11d48",
                border: deal.paymentType === "bx_only" ? "1px solid #bbf7d0" : "1px solid #fecdd3"
              }}>
                {deal.paymentType === "bx_only" ? "✅ รับ BX 100%" : `💳 เงินสด 50% + BX 50%`}
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/checkout?id=${deal.id}&price=${deal.totalPrice}&type=${deal.paymentType}`} style={{ display: 'block', width: "100%", marginTop: "16px", textDecoration: 'none' }}>
              <button style={{ width: "100%", padding: "12px", backgroundColor: "#1a1a1a", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
                ติดต่อซื้อ / จ่ายเงิน
              </button>
            </Link>

          </div>
        ))}
      </div>
    </div>
  );
}
