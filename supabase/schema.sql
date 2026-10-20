-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Customers table (Accounts Receivable - Inbound Cash Flow & Counterparties)
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    payment_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Legacy compatibility table for vendors
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    payment_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Customer payment history (Receivables & Invoices)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    due_date DATE,
    payment_date DATE,
    status TEXT
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all application tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- USERS POLICIES
-- ------------------------------------------
CREATE POLICY "Users can view own user record"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own user record"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own user record"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------
-- COMPANIES POLICIES
-- ------------------------------------------
CREATE POLICY "Users can view their own companies"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------
-- CUSTOMERS POLICIES
-- ------------------------------------------
CREATE POLICY "Users can view customers for their companies"
    ON customers FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert customers for their companies"
    ON customers FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update customers for their companies"
    ON customers FOR UPDATE
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete customers for their companies"
    ON customers FOR DELETE
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- ------------------------------------------
-- VENDORS POLICIES (LEGACY COMPATIBILITY)
-- ------------------------------------------
CREATE POLICY "Users can view vendors for their companies"
    ON vendors FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vendors for their companies"
    ON vendors FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update vendors for their companies"
    ON vendors FOR UPDATE
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete vendors for their companies"
    ON vendors FOR DELETE
    USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- ------------------------------------------
-- PAYMENT HISTORY POLICIES
-- ------------------------------------------
CREATE POLICY "Users can view payment history for their customers"
    ON payment_history FOR SELECT
    USING (
        customer_id IN (
            SELECT cust.id FROM customers cust
            JOIN companies c ON cust.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
        OR
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN companies c ON v.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert payment history for their customers"
    ON payment_history FOR INSERT
    WITH CHECK (
        customer_id IN (
            SELECT cust.id FROM customers cust
            JOIN companies c ON cust.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
        OR
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN companies c ON v.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update payment history for their customers"
    ON payment_history FOR UPDATE
    USING (
        customer_id IN (
            SELECT cust.id FROM customers cust
            JOIN companies c ON cust.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
        OR
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN companies c ON v.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete payment history for their customers"
    ON payment_history FOR DELETE
    USING (
        customer_id IN (
            SELECT cust.id FROM customers cust
            JOIN companies c ON cust.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
        OR
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN companies c ON v.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- ==========================================
-- AUTH USER AUTO-CREATION TRIGGER
-- ==========================================
-- Automatically insert a row into public.users when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
