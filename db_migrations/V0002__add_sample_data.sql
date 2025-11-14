-- Добавляем тестовых пользователей (пароль для всех: password)
INSERT INTO users (email, password_hash, role, balance) VALUES 
('advertiser@test.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'advertiser', 0),
('webmaster@test.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'webmaster', 25000),
('admin@cpasibo.pro', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'admin', 0);

-- Добавляем тестовые офферы
INSERT INTO offers (advertiser_id, name, description, payout, category, status, pixel_code, test_lead_completed, prepayment_paid) VALUES
(1, 'Онлайн-школа программирования', 'Курсы по разработке ПО для начинающих и профессионалов', 2500, 'Образование', 'active', '<script src="https://cpasibo.pro/pixel.js" data-offer-id="1"></script>', true, true),
(1, 'Доставка продуктов', 'Сервис доставки продуктов питания по городу', 850, 'E-commerce', 'active', '<script src="https://cpasibo.pro/pixel.js" data-offer-id="2"></script>', true, true),
(1, 'Юридические услуги', 'Консультации и сопровождение юридических процессов', 3200, 'Услуги', 'pending', '<script src="https://cpasibo.pro/pixel.js" data-offer-id="3"></script>', false, false);

-- Добавляем тестовые клики
INSERT INTO clicks (offer_id, webmaster_id, ip_address, user_agent, utm_source, utm_medium) VALUES
(1, 2, '192.168.1.1', 'Mozilla/5.0', 'cpasibo_pro', 'cpl'),
(1, 2, '192.168.1.2', 'Mozilla/5.0', 'cpasibo_pro', 'cpl'),
(2, 2, '192.168.1.3', 'Mozilla/5.0', 'cpasibo_pro', 'cpl'),
(2, 2, '192.168.1.4', 'Mozilla/5.0', 'cpasibo_pro', 'cpl');

-- Добавляем тестовые конверсии
INSERT INTO conversions (offer_id, webmaster_id, click_id, payout, commission, status, ip_address) VALUES
(1, 2, 1, 2000, 500, 'approved', '192.168.1.1'),
(2, 2, 3, 680, 170, 'approved', '192.168.1.3');
