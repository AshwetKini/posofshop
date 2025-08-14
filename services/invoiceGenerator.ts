import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Database } from '@/types/database';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleItem = Database['public']['Tables']['sale_items']['Row'];
type Store = Database['public']['Tables']['stores']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];

interface InvoiceData {
  sale: Sale;
  items: SaleItem[];
  store: Store;
  customer?: Customer;
}

export const generateInvoicePDF = async (invoiceData: InvoiceData) => {
  const { sale, items, store, customer } = invoiceData;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${sale.invoice_number}</title>
      <style>
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .store-name {
          font-size: 28px;
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 10px;
        }
        .store-details {
          color: #666;
          font-size: 14px;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-details, .customer-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          width: 48%;
        }
        .invoice-details h3, .customer-details h3 {
          margin-top: 0;
          color: #3B82F6;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th, .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #3B82F6;
          color: white;
          font-weight: bold;
        }
        .items-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .totals {
          margin-left: auto;
          width: 300px;
          border: 2px solid #3B82F6;
          border-radius: 8px;
          overflow: hidden;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          border-bottom: 1px solid #ddd;
        }
        .totals-row:last-child {
          border-bottom: none;
          background-color: #3B82F6;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${store.name}</div>
        <div class="store-details">
          ${store.address || ''}<br>
          ${store.phone || ''}
        </div>
      </div>

      <div class="invoice-info">
        <div class="invoice-details">
          <h3>Invoice Details</h3>
          <p><strong>Invoice #:</strong> ${sale.invoice_number}</p>
          <p><strong>Date:</strong> ${new Date(sale.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${sale.status.toUpperCase()}</p>
        </div>
        
        <div class="customer-details">
          <h3>Customer Details</h3>
          ${customer ? `
            <p><strong>Name:</strong> ${customer.name}</p>
            <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
          ` : `
            <p><strong>Walk-in Customer</strong></p>
          `}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.item_name}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">₹${item.unit_price.toFixed(2)}</td>
              <td class="text-right">₹${item.total_price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>₹${sale.subtotal.toFixed(2)}</span>
        </div>
        ${sale.discount_amount > 0 ? `
          <div class="totals-row">
            <span>Discount:</span>
            <span>-₹${sale.discount_amount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${sale.tax_amount > 0 ? `
          <div class="totals-row">
            <span>Tax:</span>
            <span>₹${sale.tax_amount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="totals-row">
          <span>Total:</span>
          <span>₹${sale.total.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Paid:</span>
          <span>₹${sale.paid_amount.toFixed(2)}</span>
        </div>
        ${sale.total - sale.paid_amount > 0 ? `
          <div class="totals-row">
            <span>Balance Due:</span>
            <span>₹${(sale.total - sale.paid_amount).toFixed(2)}</span>
          </div>
        ` : ''}
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    return { uri, error: null };
  } catch (error) {
    return { uri: null, error: error instanceof Error ? error.message : 'PDF generation failed' };
  }
};

export const shareInvoice = async (uri: string) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Invoice',
      });
    }
  } catch (error) {
    console.error('Error sharing invoice:', error);
  }
};