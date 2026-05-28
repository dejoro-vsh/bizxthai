import Link from "next/link";

export default function Marketplace() {
  // Mock Data for the Feed
  const deals = [
    {
      id: 1,
      sellerName: "SuperPrint Co.,Ltd",
      avatar: "https://i.pravatar.cc/150?img=33",
      title: "บริการพิมพ์บรรจุภัณฑ์และฉลากสินค้า (ว่าง 2 คิว)",
      image: "https://images.unsplash.com/photo-1624458514102-1811eb2ed33c?q=80&w=800&auto=format&fit=crop",
      totalPrice: 20000,
      paymentType: "hybrid", // 50% Cash / 50% BX
      time: "2 ชม. ที่แล้ว"
    },
    {
      id: 2,
      sellerName: "Studio Light",
      avatar: "https://i.pravatar.cc/150?img=47",
      title: "ให้เช่าสตูดิโอถ่ายภาพ พร้อมอุปกรณ์ครบเซ็ต (รายวัน)",
      image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop",
      totalPrice: 5000,
      paymentType: "bx_only", // 100% BX
      time: "5 ชม. ที่แล้ว"
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
        {deals.map((deal) => (
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
                {deal.paymentType === "bx_only" ? "✅ รับ BX 100%" : "💳 เงินสด 50% + BX 50%"}
              </div>
            </div>

            {/* Action Button */}
            <button style={{ width: "100%", marginTop: "16px", padding: "12px", backgroundColor: "#1a1a1a", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
              ติดต่อซื้อ / จ่ายเงิน
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
