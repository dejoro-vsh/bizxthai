import Link from "next/link";

export default function SellerDashboard() {
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
    </div>
  );
}
