# 🚀 bizxthai.com - Brand Strategy & Architectural Blueprint
> **System Status:** 2026 Production Specification (Serverless & LINE Native)  
> **Core Mission:** แพลตฟอร์มพันธมิตรธุรกิจและการจัดสรรทรัพยากรที่เหลือใช้ (Idle Capacity) ขับเคลื่อนด้วยระบบเครดิตจำลองและการหักกลบลบหนี้อัตโนมัติ (Automated Clearing Ledger) สำหรับผู้ประกอบการไทย 100%

---

## 📌 1. Brand Identity & Positioning

* **ชื่อธุรกิจ/แพลตฟอร์ม:** `bizxthai.com` (สถานะโดเมน: .com พร้อมใช้)
* **การตีความแบรนด์:** * **Biz:** ศูนย์รวมธุรกิจ SME และกลุ่มผู้ประกอบการไทย
    * **X:** Exchange (การแลกเปลี่ยน), Collaboration (พันธมิตร), และ Exponential Growth (การเติบโตทวีคูณ)
    * **Thai:** ความเป็นน้ำหนึ่งใจเดียวและมุ่งเน้นการช่วยปลดล็อกข้อจำกัดทางธุรกิจในตลาดประเทศไทย
* **จุดยืนทางกลยุทธ์ (Positioning):** ป้องกันการเข้าใจผิดเรื่องกระแสเงินสดธรรมชาติ ด้วยการสลัดคำว่า "Barter" หรือคำที่ซ้ำซ้อนกับ "PromptPay" ออกไปอย่างเด็ดขาด โดยวางตัวเป็น **"ระบบกระเป๋าเครดิตกลางที่สร้างสภาพคล่องทางธุรกิจโดยไม่ต้องพึ่งพาเงินสด (B2B Liquidity Ecosystem)"**

---

## 🎯 2. Tokenomics & Financial Logic: "BX Point"

ระบบนิเวศจะขับเคลื่อนโดยแต้มสมุดบัญชีกลางที่เรียกว่า **"BX Point"** โดยมีกฎเหล็กดังนี้:

* **Pegging Value:** $1 \text{ BX Point} = 1 \text{ Baht}$ คงที่เสมอ เพื่อความโปร่งใส ปรับใช้ในระบบบัญชีและภาษีของไทยได้ง่าย ไม่สับสน
* **Seed Liquidity (วงเงินเครดิตหมุนเวียน):** ร้านค้าใหม่ที่เข้ามาจะได้รับสิทธิ์ในการใช้วงเงินติดลบได้ (Overdraft Limit / OD) เริ่มต้นที่ `-5,000 BX` เพื่อให้มีแต้มไปสแกนแลกเปลี่ยนบริการจากร้านอื่นได้ทันทีแม้ยังไม่ได้ขายของตัวเอง ช่วยปั๊มสภาพคล่องให้ระบบปิดในช่วงเริ่มต้น

---

## 🛠️ 3. Tech Stack & DevOps Strategy (Antigravity-Friendly)

เพื่อการดูแลระบบด้วยทีมขนาดเล็ก (Solo-Founder friendly) และมีโครงสร้างที่เบา (Lightweight & Scalable):
* **Front-end Client:** LINE Application (รันผ่าน **LINE LIFF Framework**) ปลดล็อก Friction การดาวน์โหลดแอป ลูกค้าเข้าใช้ผ่าน Rich Menu และสแกน QR Code ใน LINE ได้เลย
* **Platform Runtime:** **Next.js (React / TypeScript)** ขับเคลื่อนผ่าน API Routes บนสถาปัตยกรรม Serverless
* **DevOps & Infrastructure:** ระบบควบคุมเวอร์ชันผ่าน **GitHub** และผูกมัด Auto-Deployment แบบ 100% ไปที่ **Vercel**
* **Database:** Serverless PostgreSQL (**Supabase** หรือ **Neon**) ที่รองรับ Transaction ปลอดภัยสูง

---

## 📊 4. Database Schema Specification (PostgreSQL)

โครงสร้าง Ledger ฐานข้อมูลห้ามทำการ `UPDATE` หรือ `DELETE` ตัว Transaction เด็ดขาด ใช้หลักการ **Double-Entry Insert Only** เพื่อความโปร่งใสสูงสุด

```sql
-- 1. ตารางกระเป๋าเครดิตกลางของแต่ละร้านค้า (ผูกติดกับ LINE User ID)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(255) UNIQUE NOT NULL, 
    merchant_name VARCHAR(255) NOT NULL,
    bx_balance DECIMAL(15, 2) DEFAULT 0.00,
    credit_limit DECIMAL(15, 2) DEFAULT 5000.00, -- แลกเปลี่ยนก่อนล่วงหน้าได้
    status VARCHAR(50) DEFAULT 'active', -- active, suspended
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางบันทึกการหักกลบลบหนี้ (Ledger Book)
CREATE TABLE bx_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_wallet_id UUID REFERENCES wallets(id) ON DELETE RESTRICT,   -- ร้านค้าผู้ซื้อ (แต้มลด)
    receiver_wallet_id UUID REFERENCES wallets(id) ON DELETE RESTRICT, -- ร้านค้าผู้ขาย (แต้มเพิ่ม)
    bx_amount DECIMAL(15, 2) NOT NULL CHECK (bx_amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางกระดานจับคู่ Idle Capacity (Marketplace)
CREATE TABLE idle_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    bx_value_estimated DECIMAL(15, 2),
    deal_type VARCHAR(50) NOT NULL, -- 'supply' (ฉันมีของเหลือ) หรือ 'demand' (ฉันต้องการของ)
    status VARCHAR(50) DEFAULT 'open', -- open, matched, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);