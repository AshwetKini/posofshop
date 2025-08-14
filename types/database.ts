export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string | null;
          phone: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          total_purchases: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          total_purchases?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          total_purchases?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          sku: string | null;
          barcode: string | null;
          category: string | null;
          price: number;
          cost: number;
          stock_quantity: number;
          reorder_level: number;
          supplier_id: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          sku?: string | null;
          barcode?: string | null;
          category?: string | null;
          price: number;
          cost?: number;
          stock_quantity?: number;
          reorder_level?: number;
          supplier_id?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          sku?: string | null;
          barcode?: string | null;
          category?: string | null;
          price?: number;
          cost?: number;
          stock_quantity?: number;
          reorder_level?: number;
          supplier_id?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          invoice_number: string;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total: number;
          paid_amount: number;
          status: 'completed' | 'partial' | 'pending' | 'cancelled';
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          invoice_number: string;
          subtotal: number;
          tax_amount?: number;
          discount_amount?: number;
          total: number;
          paid_amount?: number;
          status?: 'completed' | 'partial' | 'pending' | 'cancelled';
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string | null;
          invoice_number?: string;
          subtotal?: number;
          tax_amount?: number;
          discount_amount?: number;
          total?: number;
          paid_amount?: number;
          status?: 'completed' | 'partial' | 'pending' | 'cancelled';
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          item_id: string;
          item_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          item_id: string;
          item_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          item_id?: string;
          item_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          sale_id: string;
          customer_id: string | null;
          amount: number;
          payment_method: string;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          customer_id?: string | null;
          amount: number;
          payment_method?: string;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          customer_id?: string | null;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      deliveries: {
        Row: {
          id: string;
          store_id: string;
          supplier_id: string;
          delivery_date: string;
          total_cost: number;
          payment_status: 'paid' | 'pending' | 'partial';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          supplier_id: string;
          delivery_date?: string;
          total_cost?: number;
          payment_status?: 'paid' | 'pending' | 'partial';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          supplier_id?: string;
          delivery_date?: string;
          total_cost?: number;
          payment_status?: 'paid' | 'pending' | 'partial';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_items: {
        Row: {
          id: string;
          delivery_id: string;
          item_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          item_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          delivery_id?: string;
          item_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };
      stock_adjustments: {
        Row: {
          id: string;
          store_id: string;
          item_id: string;
          adjustment_type: 'in' | 'out' | 'adjustment';
          quantity: number;
          reason: string | null;
          reference_type: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          item_id: string;
          adjustment_type: 'in' | 'out' | 'adjustment';
          quantity: number;
          reason?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          item_id?: string;
          adjustment_type?: 'in' | 'out' | 'adjustment';
          quantity?: number;
          reason?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}