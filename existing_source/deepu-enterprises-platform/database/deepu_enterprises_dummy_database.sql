-- Dummy database for Deepu Enterprises website
-- Database: MySQL 8.0+
-- All records are fictional sample data for development/testing.

CREATE DATABASE IF NOT EXISTS deepu_enterprises
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE deepu_enterprises;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS distribution_partners;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS business_stats;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE brands (
  brand_id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE distribution_partners (
  partner_id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id INT NOT NULL,
  category_id INT NOT NULL,
  partnership_type ENUM('Authorized Distributor','Dealer','Supply Partner','Logistics Partner') DEFAULT 'Authorized Distributor',
  region VARCHAR(150) DEFAULT 'Mysuru, Karnataka',
  since_year YEAR,
  status ENUM('Active','Inactive','Pending') DEFAULT 'Active',
  FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  brand_id INT,
  product_name VARCHAR(180) NOT NULL,
  sku VARCHAR(60) UNIQUE,
  description TEXT,
  unit VARCHAR(40) DEFAULT 'Piece',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
);

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  business_name VARCHAR(180),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Karnataka',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inquiries (
  inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  email VARCHAR(180),
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  inquiry_type ENUM('Product Enquiry','Distribution','Bulk Order','General') DEFAULT 'General',
  inquiry_status ENUM('New','In Progress','Responded','Closed') DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  order_status ENUM('Pending','Confirmed','Dispatched','Delivered','Cancelled') DEFAULT 'Pending',
  payment_status ENUM('Unpaid','Partially Paid','Paid') DEFAULT 'Unpaid',
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE gallery (
  gallery_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_category ENUM('Store','Products','Brands','Warehouse','Events') DEFAULT 'Store',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE business_stats (
  stat_id INT AUTO_INCREMENT PRIMARY KEY,
  stat_key VARCHAR(80) NOT NULL UNIQUE,
  stat_value VARCHAR(80) NOT NULL,
  label VARCHAR(150) NOT NULL,
  display_order INT DEFAULT 0
);

INSERT INTO categories (category_name, slug, description, display_order) VALUES
('Consumer Goods','consumer-goods','Everyday consumer and household products.',1),
('Industrial Supplies','industrial-supplies','Industrial, plumbing, hardware and electrical supplies.',2),
('Agro Products','agro-products','Products and supplies for agricultural requirements.',3),
('Logistics Partners','logistics-partners','Transport and logistics support partners.',4);

INSERT INTO brands (brand_name, description, website_url) VALUES
('Astral','Pipes, fittings, adhesives and plumbing solutions.','https://www.astralpipes.com/'),
('Panasonic','Electrical products and LED lighting solutions.','https://www.panasonic.com/in/'),
('Hansa Green','LED lighting products and energy-efficient solutions.',NULL),
('Klassey','Lighting and electrical product range.',NULL),
('Supreme','Pipes, fittings and building material solutions.','https://www.supreme.co.in/'),
('Havells','Electrical products, switches and lighting.','https://www.havells.com/'),
('Generic Hardware','General hardware, tools and accessories.',NULL);

INSERT INTO distribution_partners
(brand_id, category_id, partnership_type, region, since_year, status) VALUES
(1,2,'Authorized Distributor','Mysuru, Karnataka',2018,'Active'),
(2,2,'Dealer','Mysuru, Karnataka',2020,'Active'),
(3,2,'Authorized Distributor','Mysuru, Karnataka',2021,'Active'),
(4,2,'Supply Partner','Mysuru, Karnataka',2022,'Active'),
(5,2,'Dealer','Mysuru region',2019,'Active'),
(6,1,'Supply Partner','Mysuru region',2023,'Active'),
(7,2,'Supply Partner','Karnataka',2017,'Active');

INSERT INTO products
(category_id, brand_id, product_name, sku, description, unit, price, stock_quantity, is_featured) VALUES
(2,1,'Astral PVC Pipe 1 inch','AST-PVC-001','PVC pipe for plumbing applications.','Length',185.00,120,1),
(2,1,'Astral BondTite Fast & Clear 1 kg','AST-ADH-001','Clear, fast-setting multipurpose adhesive.','Pack',420.00,45,1),
(2,2,'Panasonic LED Bulb 23W','PAN-LED-023','Energy-efficient 23W LED bulb.','Piece',210.00,80,1),
(2,3,'Hansa Green LED Panel Light','HAN-LED-PL01','LED panel light for indoor lighting.','Piece',650.00,35,1),
(2,4,'Klassey LED Batten Light','KLA-LED-BT01','LED batten light for residential and commercial use.','Piece',380.00,50,0),
(2,5,'Supreme PVC Elbow 1 inch','SUP-FIT-EL01','PVC elbow pipe fitting.','Piece',18.00,300,0),
(2,6,'Havells Modular Switch','HAV-SW-001','Standard modular electrical switch.','Piece',65.00,150,0),
(2,7,'Combination Plier 8 inch','GEN-TOOL-PL8','General-purpose insulated-handled plier.','Piece',190.00,25,0),
(2,7,'Electrical Insulation Tape','GEN-TAPE-001','PVC insulation tape for electrical work.','Roll',25.00,200,0),
(3,7,'Agricultural Water Hose','AGR-HOSE-001','Flexible hose for general agricultural water use.','Meter',32.00,500,0),
(1,7,'LED Night Lamp','CON-LED-NL01','Compact LED night lamp for home use.','Piece',95.00,60,0),
(1,7,'Extension Board 4 Socket','CON-EXT-004','Four-socket electrical extension board.','Piece',350.00,20,0);

INSERT INTO customers
(customer_name, email, phone, business_name, address, city, state) VALUES
('Ramesh Kumar','ramesh@example.com','9876543210','RK Electricals','Devaraja Market Road','Mysuru','Karnataka'),
('Anitha Stores','anitha@example.com','9876501234','Anitha Stores','Vijayanagar','Mysuru','Karnataka'),
('Suresh B.','suresh@example.com','9988776655','Sri Sai Plumbing Works','Hunsur Road','Mysuru','Karnataka');

INSERT INTO inquiries
(customer_name, email, phone, subject, message, inquiry_type, inquiry_status) VALUES
('Ramesh Kumar','ramesh@example.com','9876543210','Bulk LED bulb requirement','Please share pricing for 100 Panasonic LED bulbs.','Bulk Order','New'),
('Anitha Stores','anitha@example.com','9876501234','Distribution enquiry','I am interested in becoming a dealer in my area.','Distribution','In Progress'),
('Suresh B.','suresh@example.com','9988776655','PVC pipe availability','Please confirm availability and wholesale price.','Product Enquiry','Responded');

INSERT INTO orders
(customer_id, order_number, total_amount, order_status, payment_status, notes) VALUES
(1,'DE-2026-0001',840.00,'Confirmed','Paid','Sample order for electrical products.'),
(2,'DE-2026-0002',555.00,'Pending','Unpaid','Sample household and lighting order.');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES
(1,3,2,210.00,420.00),
(1,2,1,420.00,420.00),
(2,11,3,95.00,285.00),
(2,9,2,25.00,50.00),
(2,7,  2,110.00,220.00);

INSERT INTO gallery (title, description, image_url, image_category, display_order) VALUES
('Deepu Enterprises Storefront','Exterior view of the Deepu Enterprises shop.','/assets/images/store-front.jpg','Store',1),
('Electrical Products','Sample display of LED bulbs and electrical items.','/assets/images/electrical-products.jpg','Products',2),
('Plumbing Supplies','Pipes, fittings and plumbing accessories.','/assets/images/plumbing-supplies.jpg','Products',3),
('Authorized Brand Display','Brand and distribution partner display.','/assets/images/brand-display.jpg','Brands',4);

INSERT INTO business_stats (stat_key, stat_value, label, display_order) VALUES
('product_range','500+','Products and solutions',1),
('brand_partners','15+','Brand and distribution partners',2),
('support_hours','24hr','Customer support / business response',3);

-- Useful queries for website development:
-- 1. Display active categories:
-- SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order;

-- 2. Display brand partners with category:
-- SELECT b.brand_name, dp.partnership_type, dp.region, c.category_name
-- FROM distribution_partners dp
-- JOIN brands b ON b.brand_id = dp.brand_id
-- JOIN categories c ON c.category_id = dp.category_id
-- WHERE dp.status = 'Active';

-- 3. Display products with category and brand:
-- SELECT p.product_name, p.sku, p.price, p.stock_quantity,
--        c.category_name, b.brand_name
-- FROM products p
-- JOIN categories c ON c.category_id = p.category_id
-- LEFT JOIN brands b ON b.brand_id = p.brand_id
-- WHERE p.is_active = 1;

-- 4. Display latest enquiries:
-- SELECT * FROM inquiries ORDER BY created_at DESC;
