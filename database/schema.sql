-- database/schema.sql

-- Eklenti: UUID oluşturma fonksiyonunu aktif et
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. KULLANICILAR (USERS)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. HESAPLAR (ACCOUNTS)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'CASH', 'BANK', 'CREDIT_CARD'
    currency VARCHAR(3) DEFAULT 'TRY',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    is_included_in_net_worth BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. KATEGORİLER (CATEGORIES) -- YENİ EKLENDİ
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'INCOME', 'EXPENSE'
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE
);

-- 4. İŞLEMLER (TRANSACTIONS) -- GÜNCELLENDİ (Category ID eklendi)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Kategori bağlantısı
    type VARCHAR(10) NOT NULL, -- 'INCOME', 'EXPENSE', 'TRANSFER'
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. VARLIKLAR (ASSETS)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'GOLD', 'STOCK', 'CRYPTO', 'FOREX'
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(15, 5) NOT NULL DEFAULT 0,
    avg_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_value DECIMAL(15, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. VARLIK GEÇMİŞİ (ASSET_TRANSACTIONS) -- YENİ EKLENDİ
CREATE TABLE asset_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL, -- 'BUY', 'SELL'
    quantity DECIMAL(15, 5) NOT NULL,
    price_per_unit DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BORÇLAR (DEBTS)
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    due_date DATE,
    type VARCHAR(20) DEFAULT 'LOAN',
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);