-- ----------------------------
-- MarketSphere schema (MySQL)
-- ----------------------------

-- Drop existing tables (safe to run repeatedly)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_seller TINYINT(1) DEFAULT 0,
  is_buyer TINYINT(1) DEFAULT 1,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Addresses
CREATE TABLE addresses (
  address_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Categories
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- Products
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity >= 0),
  `condition` VARCHAR(20) DEFAULT 'new',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB;

-- Product images
CREATE TABLE product_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Persistent cart items (one cart per user implied)
CREATE TABLE cart_items (
  cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

-- Orders
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  shipping_address_id INT,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'Pending',
  order_status VARCHAR(20) DEFAULT 'Placed',
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(user_id),
  FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id)
) ENGINE=InnoDB;

-- Order items
CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (seller_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Messages
CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  product_id INT,
  order_id INT,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) DEFAULT 0,
  FOREIGN KEY (sender_id) REFERENCES users(user_id),
  FOREIGN KEY (receiver_id) REFERENCES users(user_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB;

-- Reviews
CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  buyer_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_buyer (product_id, buyer_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (buyer_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- Audit log
CREATE TABLE audit_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50),
  details JSON,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Useful indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_messages_receiver_isread ON messages(receiver_id, is_read);

-- Fulltext for product search (works in modern MySQL/InnoDB)
ALTER TABLE products ADD FULLTEXT IF NOT EXISTS ft_title_description (title, description);

-- Simple audit triggers (order/message inserts)
DELIMITER $$
DROP TRIGGER IF EXISTS trg_audit_orders_after_insert$$
CREATE TRIGGER trg_audit_orders_after_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (event_type, details)
  VALUES ('orders_insert', JSON_OBJECT('order_id', NEW.order_id, 'buyer_id', NEW.buyer_id, 'total', NEW.total_amount));
END$$

DROP TRIGGER IF EXISTS trg_audit_messages_after_insert$$
CREATE TRIGGER trg_audit_messages_after_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (event_type, details)
  VALUES ('messages_insert', JSON_OBJECT('message_id', NEW.message_id, 'sender', NEW.sender_id, 'receiver', NEW.receiver_id));
END$$
DELIMITER ;

-- End of schema
