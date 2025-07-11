-- Insert default admin user
-- Note: Password is 'Admin123!' hashed with bcrypt
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
  'admin',
  'admin@transferglobal.com',
  '$2b$10$rQZ8kHp.TB.It.NuiNdxaOehNn9s7V8qTa4i2QzQhOtU5qXqYqYqy',
  'admin',
  true
) ON CONFLICT (username) DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (key, value, description) VALUES
  ('company_defaults', '{
    "companyName": "Transfer Global Inc.",
    "companyAddress": "2135 De la Montagnes\nMontreal, QC, H3G 1Z8",
    "companyPhone": "",
    "companyEmail": "finance@linx.fi",
    "companyLogo": "/linx-logo.png"
  }', 'Default company information for new proposals'),
  
  ('default_card_fees', '[
    {"cardType": "VISA", "enabled": true, "percentageFee": 2.9, "fixedFee": 0.3, "currency": "USD"},
    {"cardType": "MasterCard", "enabled": true, "percentageFee": 2.9, "fixedFee": 0.3, "currency": "USD"},
    {"cardType": "Discover", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"cardType": "Amex", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"cardType": "MaestroCard", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"cardType": "DinersClub", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"cardType": "JCB", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"cardType": "UnionPay", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"}
  ]', 'Default card processing fees'),
  
  ('default_additional_fees', '[
    {"feeType": "Setup Fee", "enabled": false, "percentageFee": 0, "fixedFee": 0, "currency": "USD"},
    {"feeType": "Chargeback Fee", "enabled": false, "percentageFee": 0, "fixedFee": 55, "currency": "USD"},
    {"feeType": "Dispute Fee", "enabled": false, "percentageFee": 0, "fixedFee": 25, "currency": "USD"},
    {"feeType": "Declined Transaction Fee", "enabled": false, "percentageFee": 0, "fixedFee": 0.55, "currency": "USD"},
    {"feeType": "Refunded Transaction Fee", "enabled": false, "percentageFee": 0, "fixedFee": 15, "currency": "USD"},
    {"feeType": "Reserve", "enabled": false, "percentageFee": 10, "fixedFee": 0, "currency": "USD", "days": 180}
  ]', 'Default additional fees'),
  
  ('default_settlement_terms', '{
    "settlementPeriod": "T+2 Business Days",
    "settlementFee": 0,
    "settlementCurrency": "USD",
    "minimumSettlement": 0
  }', 'Default settlement terms'),
  
  ('session_timeout_minutes', '480', 'Session timeout in minutes (8 hours default)'),
  
  ('password_policy', '{
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": true
  }', 'Password policy requirements')

ON CONFLICT (key) DO NOTHING;
