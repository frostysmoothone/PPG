-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(255),
  company_logo TEXT,
  default_card_fees JSONB,
  default_additional_fees JSONB,
  default_settlement_terms JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) OR NOT EXISTS (SELECT 1 FROM users)
);
CREATE POLICY "Only admins can update users" ON users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Only admins can delete users" ON users FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for proposals table
CREATE POLICY "Users can view their own proposals" ON proposals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own proposals" ON proposals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own proposals" ON proposals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own proposals" ON proposals FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for system_settings table
CREATE POLICY "Anyone can view system settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can modify system settings" ON system_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at);

-- Insert default admin user (plain text password for development)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@transferglobal.com', 'Admin123!', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (
  company_name, 
  company_address, 
  company_phone, 
  company_email, 
  company_logo,
  default_card_fees,
  default_additional_fees,
  default_settlement_terms
) VALUES (
  'Transfer Global Inc.',
  E'2135 De la Montagnes\nMontreal, QC, H3G 1Z8',
  '',
  'finance@linx.fi',
  '/linx-logo.png',
  '[
    {"cardType": "VISA", "enabled": true, "percentageFee": 2.9, "fixedFee": 0.3, "currency": "USD"},
    {"cardType": "MasterCard", "enabled": true, "percentageFee": 2.9, "fixedFee": 0.3, "currency": "USD"},
    {"cardType": "Discover", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"cardType": "Amex", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"}
  ]'::jsonb,
  '[
    {"feeType": "Setup Fee", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"feeType": "Chargeback Fee", "enabled": false, "percentageFee": 0, "fixedFee": 55, "currency": "USD"}
  ]'::jsonb,
  '{"settlementPeriod": "T+2 Business Days", "settlementFee": 0, "settlementCurrency": "USD", "minimumSettlement": 0}'::jsonb
) ON CONFLICT DO NOTHING;
