import Link from "next/link";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SellerDashboard() {
  noStore();
  // Fetch deals (In a real app, filter by seller_id. For demo, we fetch all open deals)
  const { rows: deals } = await sql`
    SELECT id, title, price_total, image_url, accept_cash_pct, created_at 
    FROM idle_deals 
    ORDER BY created_at DESC
  `;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#333", fontSize: "24px" }}>←</Link>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>จัดการสินค้าของฉัน</h1>
        </div>
        <Link href="/seller/create">
          <button style={{ backgroundColor: "#00B900", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
            + ลงสินค้าใหม่
          </button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="card text-center" style={{ padding: "40px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.5 }}>🛍️</div>
          <h3 style={{ color: "#333", marginBottom: "8px" }}>คุณยังไม่ได้ลงขายสินค้าใดๆ</h3>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>
            เปลี่ยนสินค้าหรือบริการของคุณให้กลายเป็นยอดขายผ่านระบบ Hybrid BX Point
          </p>
          <Link href="/seller/create">
            <button className="btn btn-primary" style={{ maxWidth: "200px" }}>เริ่มลงสินค้าเลย</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {deals.map((deal) => (
            <div key={deal.id} className="card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f5f5f5", flexShrink: 0 }}>
                {deal.image_url ? (
                  <img src={deal.image_url} alt="deal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📦</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 4px 0", color: "#1a1a1a" }}>{deal.title}</h3>
                <p style={{ fontSize: "14px", color: "#888", margin: "0 0 8px 0" }}>
                  ราคา {Number(deal.price_total).toLocaleString()} ฿
                </p>
                <span style={{ 
                  padding: "4px 8px", 
                  borderRadius: "4px", 
                  fontSize: "12px", 
                  fontWeight: 600,
                  backgroundColor: Number(deal.accept_cash_pct) === 0 ? "#e6f8e6" : "#fff1f2",
                  color: Number(deal.accept_cash_pct) === 0 ? "#00B900" : "#e11d48",
                }}>
                  {Number(deal.accept_cash_pct) === 0 ? "รับ BX 100%" : `รับเงินสด ${deal.accept_cash_pct}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
