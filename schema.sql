-- ==========================================
-- BIZXTHAI - HYBRID LIQUIDITY & MLM DATABASE SCHEMA
-- For PostgreSQL (Supabase / Neon)
-- ==========================================

-- 1. Users Table (Core Identity & MLM Hierarchy)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    member_tier VARCHAR(20) DEFAULT 'normal', -- 'normal', 'vip'
    referrer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Sponsor (MLM Uplines)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wallets Table (Credit & Cash Balances)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bx_balance DECIMAL(15, 2) DEFAULT 0.00,
    cash_balance DECIMAL(15, 2) DEFAULT 0.00, -- Optional: If system holds cash
    od_limit DECIMAL(15, 2) DEFAULT 0.00, -- VIP gets 1000 here
    status VARCHAR(50) DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transactions Ledger (Double Entry System)
-- Every transaction creates 2 rows (Sender and Receiver) or 1 row with from/to
CREATE TABLE bx_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_wallet_id UUID REFERENCES wallets(id),
    receiver_wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    tx_type VARCHAR(50) NOT NULL, -- 'payment', 'cashback_fee', 'mlm_commission', 'system_inject'
    reference_id UUID, -- Links to order or commission run
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Marketplace / Idle Deals
CREATE TABLE idle_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_total DECIMAL(15, 2) NOT NULL,
    accept_cash_pct DECIMAL(5, 2) DEFAULT 0.00, -- e.g., 50.00 for 50% Cash
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. MLM Group Volume (Monthly Aggregation)
CREATE TABLE monthly_group_volume (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    month_year VARCHAR(7) NOT NULL, -- e.g. '2026-05'
    personal_volume DECIMAL(15, 2) DEFAULT 0.00,
    group_volume DECIMAL(15, 2) DEFAULT 0.00,
    current_rate DECIMAL(5, 2) DEFAULT 0.10, -- Differential Rate
    commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    UNIQUE(user_id, month_year)
);
