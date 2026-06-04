"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#111827",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "400px", 
        width: "100%", 
        padding: "40px 30px", 
        backgroundColor: "#1F2937", 
        borderRadius: "20px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#F3F4F6", margin: "0 0 10px 0", fontSize: "28px" }}>เข้าสู่ระบบ</h1>
        <p style={{ color: "#9CA3AF", margin: "0 0 30px 0", fontSize: "14px" }}>
          กรุณาเข้าสู่ระบบด้วยบัญชี LINE เพื่อเข้าใช้งานระบบ BIZXTHAI
        </p>
        
        <button 
          onClick={() => signIn("line", { callbackUrl: "/simulator" })}
          style={{ 
            width: "100%", 
            backgroundColor: "#00B900", 
            color: "white", 
            border: "none", 
            padding: "14px", 
            borderRadius: "10px", 
            fontSize: "16px", 
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}
        >
          <div style={{ backgroundColor: "white", color: "#00B900", width: "24px", height: "24px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>L</div>
          เข้าสู่ระบบด้วย LINE
        </button>
      </div>
    </div>
  );
}
