/*
  # Grocery POS & Inventory System - Initial Schema

  This migration sets up the complete database schema for a grocery POS and inventory management system.

  ## 1. New Tables
  
  ### Core Business Tables
  - `stores` - Store information with owner reference
  - `customers` - Customer management with contact details
  - `suppliers` - Supplier management for inventory sourcing
  - `inventory_items` - Product catalog with pricing and stock
  - `sales` - Transaction records with payment tracking
  - `sale_items` - Line items for each sale
  - `payments` - Payment tracking for sales
  - `deliveries` - Supplier delivery records
  - `delivery_items` - Items received in each delivery
  - `stock_adjustments` - Stock level changes tracking

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for store owners to access only their data
  - Ensure data isolation between different stores

  ## 3. Features
  - UUID primary keys for all tables
  - Proper foreign key relationships
  - Timestamp tracking for audit trails
  - Flexible payment and stock management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address text,
  phone text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  total_purchases numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sku text,
  barcode text,
  category text,
  price numeric NOT NULL DEFAULT 0,
  cost numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  reorder_level integer DEFAULT 0,
  supplier_id uuid REFERENCES suppliers(id),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  invoice_number text NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  status text CHECK (status IN ('completed', 'partial', 'pending', 'cancelled')) DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES inventory_items(id) NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'cash',
  payment_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) NOT NULL,
  delivery_date timestamptz DEFAULT now(),
  total_cost numeric DEFAULT 0,
  payment_status text CHECK (payment_status IN ('paid', 'pending', 'partial')) DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Delivery items table
CREATE TABLE IF NOT EXISTS delivery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid REFERENCES deliveries(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES inventory_items(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Stock adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
  adjustment_type text CHECK (adjustment_type IN ('in', 'out', 'adjustment')) NOT NULL,
  quantity integer NOT NULL,
  reason text,
  reference_type text, -- 'sale', 'delivery', 'manual'
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Stores
CREATE POLICY "Store owners can manage their stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for Customers
CREATE POLICY "Store owners can manage their customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- RLS Policies for Suppliers
CREATE POLICY "Store owners can manage their suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- RLS Policies for Inventory Items
CREATE POLICY "Store owners can manage their inventory"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- RLS Policies for Sales
CREATE POLICY "Store owners can manage their sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- RLS Policies for Sale Items
CREATE POLICY "Store owners can manage their sale items"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (sale_id IN (SELECT id FROM sales WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));

-- RLS Policies for Payments
CREATE POLICY "Store owners can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (sale_id IN (SELECT id FROM sales WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));

-- RLS Policies for Deliveries
CREATE POLICY "Store owners can manage their deliveries"
  ON deliveries
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- RLS Policies for Delivery Items
CREATE POLICY "Store owners can manage their delivery items"
  ON delivery_items
  FOR ALL
  TO authenticated
  USING (delivery_id IN (SELECT id FROM deliveries WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));

-- RLS Policies for Stock Adjustments
CREATE POLICY "Store owners can manage stock adjustments"
  ON stock_adjustments
  FOR ALL
  TO authenticated
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_store_id ON suppliers(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_store_id ON inventory_items(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_store_id ON deliveries(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_store_id ON stock_adjustments(store_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();