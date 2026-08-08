import nodemailer from "nodemailer";
import { config } from "../config/config.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendOTPEmail(email, otp, fullName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Snitch Clothing OTP Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Welcome to Snitch Clothing! 🎉</h2>
              
              <p style="color: #666; font-size: 16px; margin-bottom: 10px;">Hi <strong>${fullName}</strong>,</p>
              
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                Thank you for signing up! To complete your registration, please use the following OTP (One-Time Password):
              </p>
              
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">Your OTP Code:</p>
                <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0; letter-spacing: 5px;">${otp}</p>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-bottom: 20px;">
                <strong>⏱️ This OTP will expire in 3 minutes</strong>
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 3px;">
                <p style="color: #856404; margin: 0;">
                  ⚠️ <strong>Security Note:</strong> Never share your OTP with anyone. Snitch Clothing support will never ask for your OTP.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                Didn't sign up for Snitch Clothing? Please ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2026 Snitch Clothing. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      return {
        success: true,
        message: "OTP sent to your email",
      };
    } catch (error) {
      console.log("Error sending email:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, fullName) {
    try {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      const mailOptions = {
        from: `"Snitch" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Snitch — Your Style Journey Begins ✨",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f3f0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fbf9f6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              
              <!-- Hero Banner -->
              <div style="background-color: #1b1c1a; padding: 48px 30px; text-align: center;">
                <p style="color: #C9A96E; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 12px 0; font-weight: 600;">
                  Snitch
                </p>
                <h1 style="color: #fbf9f6; font-size: 28px; font-weight: 300; margin: 0; letter-spacing: 0.5px;">
                  Welcome, ${fullName} 🎉
                </h1>
              </div>

              <!-- Body -->
              <div style="padding: 40px 36px;">
                <p style="color: #1b1c1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your account is officially live. You've just joined an exclusive
                  circle of creators and style-first shoppers redefining what
                  modern fashion looks like.
                </p>

                <p style="color: #7A6E63; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                  Here's a quick look at what's waiting for you:
                </p>

                <!-- Feature Grid -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                  <tr>
                    <td style="padding: 16px; background-color: #f5f3f0; border-radius: 8px; width: 33%; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🛍️</div>
                      <p style="color: #1b1c1a; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">New Drops</p>
                    </td>
                    <td style="width: 12px;"></td>
                    <td style="padding: 16px; background-color: #f5f3f0; border-radius: 8px; width: 33%; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 8px;">✨</div>
                      <p style="color: #1b1c1a; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Curated Picks</p>
                    </td>
                    <td style="width: 12px;"></td>
                    <td style="padding: 16px; background-color: #f5f3f0; border-radius: 8px; width: 33%; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🎁</div>
                      <p style="color: #1b1c1a; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Member Perks</p>
                    </td>
                  </tr>
                </table>

                <!-- CTA -->
                <div style="text-align: center; margin: 36px 0 8px 0;">
                  <a href="${clientUrl}"
                     style="display: inline-block; padding: 16px 40px; background-color: #1b1c1a;
                            color: #fbf9f6; text-decoration: none; text-transform: uppercase;
                            font-size: 12px; letter-spacing: 2.5px; border-radius: 4px; font-weight: 500;">
                    Start Shopping
                  </a>
                </div>
                <p style="text-align: center; margin: 12px 0 0 0;">
                  <a href="${clientUrl}/profile" style="color: #C9A96E; font-size: 12px; text-decoration: underline; text-underline-offset: 3px;">
                    Complete your style profile →
                  </a>
                </p>
              </div>

              <!-- Divider -->
              <div style="border-top: 1px solid #e4e2df; margin: 0 36px;"></div>

              <!-- Social / Footer -->
              <div style="padding: 28px 36px; text-align: center;">
                <p style="color: #7A6E63; font-size: 13px; margin: 0 0 16px 0;">
                  Follow us for daily drops & style inspiration
                </p>
                <div style="margin-bottom: 20px;">
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #1b1c1a; font-size: 13px; text-decoration: none; font-weight: 500;">Instagram</a>
                  <span style="color: #d0c5b5;">•</span>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #1b1c1a; font-size: 13px; text-decoration: none; font-weight: 500;">Pinterest</a>
                  <span style="color: #d0c5b5;">•</span>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #1b1c1a; font-size: 13px; text-decoration: none; font-weight: 500;">TikTok</a>
                </div>
                <p style="color: #B5ADA3; font-size: 11px; margin: 0;">
                  © 2026 Snitch Clothing. All rights reserved.
                </p>
              </div>

            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Welcome email sent:", info.response);
      return {
        success: true,
        message: "Welcome email sent",
      };
    } catch (error) {
      console.log("Error sending welcome email:", error);
      // Don't throw — a failed welcome email shouldn't block registration
    }
  }

  async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log("Email service is ready to send emails");
    } catch (error) {
      console.log("Email service error:", error);
    }
  }

  async sendOrderConfirmationEmail(email, fullName, order) {
    try {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      const itemsHtml = order.orderItems
        .map(
          (item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e4e2df;">
            <img src="${item.images?.[0]?.url || ""}" width="56" height="70" style="object-fit: cover; border-radius: 6px; display: block;" />
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e4e2df;">
            <p style="margin: 0; font-size: 14px; color: #1b1c1a;">${item.title}</p>
            <p style="margin: 6px 0 0; font-size: 12px; color: #7A6E63; text-transform: uppercase; letter-spacing: 0.5px;">Qty: ${item.quantity}</p>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e4e2df; text-align: right; font-size: 14px; color: #1b1c1a; white-space: nowrap;">
            ${item.price.currency} ${(item.price.amount * item.quantity).toLocaleString("en-IN")}
          </td>
        </tr>
      `,
        )
        .join("");

      const estimatedDeliveryText = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "5-7 business days";

      const mailOptions = {
        from: `"Snitch" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Snitch Order is Confirmed! 🎉",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f3f0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fbf9f6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

              <!-- Hero Banner -->
              <div style="background-color: #1b1c1a; padding: 48px 30px; text-align: center;">
                <p style="color: #C9A96E; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 12px 0; font-weight: 600;">
                  Snitch
                </p>
                <h1 style="color: #fbf9f6; font-size: 26px; font-weight: 300; margin: 0; letter-spacing: 0.5px;">
                  Order Confirmed 🎉
                </h1>
              </div>

              <!-- Body -->
              <div style="padding: 40px 36px;">
                <p style="color: #1b1c1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
                  Thank you, <strong>${fullName}</strong>!
                </p>
                <p style="color: #7A6E63; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                  Your order has been placed successfully. We're getting it ready for you.
                </p>

                <!-- Order Summary -->
                <p style="color: #C9A96E; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0 0 12px 0;">
                  Order Summary
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 8px;">
                  ${itemsHtml}
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0 28px 0;">
                  <tr>
                    <td style="font-size: 14px; font-weight: 600; color: #1b1c1a; padding-top: 10px;">Total</td>
                    <td style="font-size: 16px; font-weight: 600; color: #1b1c1a; text-align: right; padding-top: 10px;">
                      ${order.price.currency} ${order.price.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </table>

                <!-- Estimated Delivery -->
                <div style="background-color: #f5f3f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7A6E63; font-weight: 600;">
                    Estimated Delivery
                  </p>
                  <p style="margin: 0; font-size: 15px; color: #1b1c1a; font-weight: 500;">
                    ${estimatedDeliveryText}
                  </p>
                </div>

                <!-- Cancellation Policy -->
                <div style="background-color: #fff3cd; border-left: 4px solid #C9A96E; padding: 16px 18px; border-radius: 4px; margin-bottom: 32px;">
                  <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                    ⏱️ <strong>Need to make a change?</strong> You can cancel this order within
                    <strong>24 hours</strong> of placing it from your Orders page. After that window,
                    the order moves into processing and can no longer be cancelled.
                  </p>
                </div>

                <!-- CTA -->
                <div style="text-align: center;">
                  <a href="${clientUrl}/orders"
                     style="display: inline-block; padding: 16px 40px; background-color: #1b1c1a;
                            color: #fbf9f6; text-decoration: none; text-transform: uppercase;
                            font-size: 12px; letter-spacing: 2.5px; border-radius: 4px; font-weight: 500;">
                    View Your Order
                  </a>
                </div>
              </div>

              <!-- Divider -->
              <div style="border-top: 1px solid #e4e2df; margin: 0 36px;"></div>

              <!-- Footer -->
              <div style="padding: 28px 36px; text-align: center;">
                <p style="color: #7A6E63; font-size: 13px; margin: 0 0 16px 0;">
                  Questions about your order? Just reply to this email.
                </p>
                <p style="color: #B5ADA3; font-size: 11px; margin: 0;">
                  © 2026 Snitch Clothing. All rights reserved.
                </p>
              </div>

            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent:", info.response);
    } catch (error) {
      console.log("Error sending order confirmation email:", error);
    }
  }

  async sendOrderCancellationEmail(email, fullName, order) {
    try {
      const itemsHtml = order.orderItems
        .map(
          (item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e4e2df;">
            <img src="${item.images?.[0]?.url || ""}" width="56" height="70" style="object-fit: cover; border-radius: 6px; display: block;" />
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e4e2df;">
            <p style="margin: 0; font-size: 14px; color: #1b1c1a;">${item.title}</p>
            <p style="margin: 6px 0 0; font-size: 12px; color: #7A6E63; text-transform: uppercase; letter-spacing: 0.5px;">Qty: ${item.quantity}</p>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e4e2df; text-align: right; font-size: 14px; color: #1b1c1a; white-space: nowrap;">
            ${item.price.currency} ${(item.price.amount * item.quantity).toLocaleString("en-IN")}
          </td>
        </tr>
      `,
        )
        .join("");

      const mailOptions = {
        from: `"Snitch" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Snitch Order Has Been Cancelled",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f3f0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fbf9f6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

              <!-- Hero Banner -->
              <div style="background-color: #1b1c1a; padding: 48px 30px; text-align: center;">
                <p style="color: #C9A96E; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 12px 0; font-weight: 600;">
                  Snitch
                </p>
                <h1 style="color: #fbf9f6; font-size: 26px; font-weight: 300; margin: 0; letter-spacing: 0.5px;">
                  Order Cancelled
                </h1>
              </div>

              <!-- Body -->
              <div style="padding: 40px 36px;">
                <p style="color: #1b1c1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
                  Hi <strong>${fullName}</strong>,
                </p>
                <p style="color: #7A6E63; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                  As requested, we've cancelled the following order. No further action is needed.
                </p>

                <!-- Order Summary -->
                <p style="color: #C9A96E; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0 0 12px 0;">
                  Cancelled Order
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 8px;">
                  ${itemsHtml}
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0 28px 0;">
                  <tr>
                    <td style="font-size: 14px; font-weight: 600; color: #1b1c1a; padding-top: 10px;">Total</td>
                    <td style="font-size: 16px; font-weight: 600; color: #1b1c1a; text-align: right; padding-top: 10px;">
                      ${order.price.currency} ${order.price.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </table>

                ${
                  order.paymentMethod === "razorpay"
                    ? `<div style="background-color: #f5f3f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 13px; color: #1b1c1a; line-height: 1.6;">
                          If payment was already made, your refund will be processed to the original
                          payment method within 5-7 business days.
                        </p>
                      </div>`
                    : ""
                }

                <!-- CTA -->
                <div style="text-align: center;">
                  <a href="${process.env.CLIENT_URL || "http://localhost:5173"}"
                     style="display: inline-block; padding: 16px 40px; background-color: #1b1c1a;
                            color: #fbf9f6; text-decoration: none; text-transform: uppercase;
                            font-size: 12px; letter-spacing: 2.5px; border-radius: 4px; font-weight: 500;">
                    Continue Shopping
                  </a>
                </div>
              </div>

              <!-- Divider -->
              <div style="border-top: 1px solid #e4e2df; margin: 0 36px;"></div>

              <!-- Footer -->
              <div style="padding: 28px 36px; text-align: center;">
                <p style="color: #7A6E63; font-size: 13px; margin: 0 0 16px 0;">
                  Questions about this cancellation? Just reply to this email.
                </p>
                <p style="color: #B5ADA3; font-size: 11px; margin: 0;">
                  © 2026 Snitch Clothing. All rights reserved.
                </p>
              </div>

            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Order cancellation email sent:", info.response);
    } catch (error) {
      console.log("Error sending order cancellation email:", error);
    }
  }
}


export const emailService = new EmailService();
