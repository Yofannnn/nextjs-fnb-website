import { OnlineOrder } from "@/types/order.type";
import { rupiah } from "@/lib/format-currency";

export function confirmOnlineOrderHTML(payload: OnlineOrder) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4CAF50;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .footer {
      background-color: #f1f1f1;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background-color: #4CAF50;
      color: #ffffff;
      text-decoration: none;
      font-size: 16px;
      border-radius: 5px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th,
    .table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .table th {
      background-color: #f4f4f4;
    }
    @media (max-width: 600px) {
      .header {
        font-size: 20px;
      }
      .content,
      .footer {
        font-size: 14px;
      }
      .button {
        font-size: 14px;
        padding: 8px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Order Confirmed</div>
    <div class="content">
      <p>Hello <strong>${payload.customerName}</strong>,</p>
      <p>Thank you for placing your order with us! Here are your order details:</p>
      
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
        ${payload.items
          .map(
            (item) => `
            <tr>
              <td>${item.productId}</td>
              <td>${item.quantity}</td>
              <td>${rupiah.format(item.price)}</td>
            </tr>
          `
          )
          .join("")}
          <tr>
            <td colspan="2" style="text-align: right;"><strong>Total</strong></td>
            <td><strong>${rupiah.format(payload.totalAmount)}</strong></td>
          </tr>
        </tbody>
      </table>

      <p>
        If you have any questions, feel free to contact us at
        <a href="mailto:support@yourrestaurant.com">support@yourrestaurant.com</a>.
      </p>

      <p>
        <a href="" class="button">See order details</a>
      </p>
    </div>
    <div class="footer">
      © 2025 Your Restaurant. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}

export function sendOTPHTML(email: string, otp: string) {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f7f7f7;
        margin: 0;
        padding: 0;
      }
      .email-container {
        width: 100%;
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }
      .email-header {
        background-color: #4caf50;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .email-header h1 {
        margin: 0;
        font-size: 24px;
      }
      .email-body {
        padding: 20px;
      }
      .email-body p {
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
      }
      .otp-code {
        display: inline-block;
        font-size: 24px;
        color: #4caf50;
        font-weight: bold;
        background-color: #f7f7f7;
        border: 1px dashed #4caf50;
        border-radius: 8px;
        padding: 10px 20px;
        margin: 20px 0;
        text-align: center;
      }
      .email-footer {
        background-color: #f1f1f1;
        padding: 10px 20px;
        text-align: center;
        font-size: 14px;
        color: #555555;
      }
      .email-footer a {
        color: #4caf50;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <h1>Your One-Time Password (OTP)</h1>
      </div>

      <!-- Body -->
      <div class="email-body">
        <p>Dear ${email},</p>
        <p>
          To proceed with accessing your account or completing your transaction, please use the OTP below. 
          This code is valid for the next <strong>5 minutes</strong>.
        </p>
        <div class="otp-code">${otp}</div>
        <p>
          If you didn't request this OTP, please disregard this email or 
          <a href="mailto:support@example.com">contact support</a> if you suspect unauthorized activity.
        </p>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>Thank you for choosing [Your Company Name].</p>
        <p><a href="#">Visit our website</a> | <a href="mailto:support@example.com">Contact Support</a></p>
      </div>
    </div>
  </body>
  </html>`;
}
