-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('advertiser', 'webmaster', 'admin')),
    telegram VARCHAR(100),
    balance DECIMAL(10, 2) DEFAULT 0,
    notifications_enabled BOOLEAN DEFAULT true,
    weekly_report_enabled BOOLEAN DEFAULT false,
    new_offers_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица офферов
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    payout DECIMAL(10, 2) NOT NULL CHECK (payout >= 500),
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'paused')),
    pixel_code TEXT,
    test_lead_completed BOOLEAN DEFAULT false,
    prepayment_amount DECIMAL(10, 2),
    prepayment_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица кликов
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id),
    webmaster_id INTEGER NOT NULL REFERENCES users(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица конверсий
CREATE TABLE conversions (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id),
    webmaster_id INTEGER NOT NULL REFERENCES users(id),
    click_id INTEGER REFERENCES clicks(id),
    payout DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    ip_address VARCHAR(45),
    converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сессий для авторизации
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_offers_advertiser ON offers(advertiser_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_clicks_offer ON clicks(offer_id);
CREATE INDEX idx_clicks_webmaster ON clicks(webmaster_id);
CREATE INDEX idx_clicks_created ON clicks(clicked_at);
CREATE INDEX idx_conversions_offer ON conversions(offer_id);
CREATE INDEX idx_conversions_webmaster ON conversions(webmaster_id);
CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
