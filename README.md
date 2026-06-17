<div align="center">
  <br />
  <h1>biz<span style="color: #10B981;">x</span>thai</h1>
  <p>
    <strong>The Future of B2B Hybrid Commerce & Liquidity Ecosystem</strong>
  </p>
  <p>
    A next-generation platform combining B2B Marketplace, Barter Trade (BX Token), and a robust Affiliate/MLM commission system—built entirely on the modern web stack.
  </p>
</div>

---

## 🌟 Overview

**BizXThai** is an innovative platform designed to solve business liquidity by enabling hybrid commerce (Cash + BX Tokens). It empowers users to build their own business networks through an advanced, maintenance-free commission system. By integrating seamlessly with LINE, user onboarding is frictionless, highly viral, and intuitive.

## 🚀 Key Features

### 🛒 1. Hybrid Payment & Marketplace
- **Dual Currency System:** Purchase items using Cash, BX (Barter Credit), or a combination of both.
- **Instant Cashback:** Receive an immediate 5% BX cashback on all cash transactions.
- **Overdraft (OD) Limits:** Smart credit limits for trusted partners.

### 📈 2. Advanced Network System (MLM / Affiliate)
- **Zero Maintenance Required:** Earn group volume commissions without forcing personal monthly purchases.
- **Infinite Width, 4-Level Deep Calculation:** Intelligent differential commission calculation based on group volume.
- **End-of-Month Batch Processing:** Transparent and accurate payouts accumulated and processed automatically on the 31st of every month.

### 📱 3. Viral Onboarding via LINE LIFF
- **Frictionless Login:** One-click registration using NextAuth LINE Provider.
- **Custom Short Links:** Generate clean, professional referral links (e.g., `bizxthai.com/go/x9v2p`).
- **Flex Message Sharing:** Native integration with LINE Share Target Picker allows members to send beautiful, highly-converting digital invitation cards directly to their LINE contacts.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (LINE Login)
- **Database:** [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) 
- **Styling:** CSS-in-JS / Inline styling with Modern Clean UI principles
- **Integrations:** LINE Frontend Framework (LIFF), LINE Flex Messages
- **Deployment:** [Vercel](https://vercel.com)

---

## ⚙️ Prerequisites & Environment Variables

To run this project locally or deploy it to production, ensure you have the following environment variables configured:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_key

# LINE Login & LIFF
LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
NEXT_PUBLIC_LIFF_ID=your_liff_id

# Vercel Postgres
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url
POSTGRES_URL_NON_POOLING=your_non_pooling_url
POSTGRES_USER=your_db_user
POSTGRES_HOST=your_db_host
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=your_db_name
```

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/dejoro-vsh/bizxthai.git
cd bizxthai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Database Migrations
If setting up for the first time, initialize the database tables by calling the setup API endpoint:
```bash
curl http://localhost:3000/api/setup-db
curl http://localhost:3000/api/migration/short-code
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏗️ Architecture Highlights

- **`app/page.tsx`**: Clean, high-converting Landing Page.
- **`app/dashboard/`**: The main member portal with balance tracking and referral sharing.
- **`app/go/[code]/page.tsx`**: The middleware/redirect engine for tracking short referral links.
- **`app/simulator/`**: A powerful sandbox environment used for testing and validating the MLM commission differential algorithms before pushing to production.
- **`lib/auth.ts`**: Handles automatic downstream placement and wallet creation during the NextAuth callback cycle.

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.
