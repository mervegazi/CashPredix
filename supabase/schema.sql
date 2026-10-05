-- Create users table
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create vendors table
CREATE TABLE vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    payment_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendor payment history
CREATE TABLE payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    due_date DATE,
    payment_date DATE,
    status TEXT
);
