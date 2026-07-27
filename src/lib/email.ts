import nodemailer from "nodemailer";
import { formatCOP } from "@/lib/format";

type OrderEmailData = {
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  notes: string | null;
  total: number;
  items: { productName: string; unitPrice: number; quantity: number }[];
};

function getTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Faltan las variables SMTP_USER / SMTP_PASS");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function orderHtml(order: OrderEmailData, forVendor: boolean): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #fce7f3;">${escapeHtml(i.productName)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #fce7f3;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #fce7f3;text-align:right;">${formatCOP(i.unitPrice)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #fce7f3;text-align:right;">${formatCOP(i.unitPrice * i.quantity)}</td>
      </tr>`
    )
    .join("");

  const intro = forVendor
    ? `<p style="margin:0 0 16px;">Has recibido un nuevo pedido de <strong>${escapeHtml(order.customerName)}</strong>.</p>`
    : `<p style="margin:0 0 16px;">Hola <strong>${escapeHtml(order.customerName)}</strong>, ¡gracias por tu pedido! Esta es tu copia. Pronto te contactaremos para coordinar la entrega y el pago.</p>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#3f3f46;">
    <div style="background:#ec4899;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;">MK Cosmetics</h1>
      <p style="margin:8px 0 0;color:#fce7f3;font-size:14px;">Pedido ${order.code}</p>
    </div>
    <div style="border:1px solid #fce7f3;border-top:0;border-radius:0 0 12px 12px;padding:24px;">
      ${intro}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#fdf2f8;">
            <th style="padding:8px 12px;text-align:left;">Producto</th>
            <th style="padding:8px 12px;text-align:center;">Cant.</th>
            <th style="padding:8px 12px;text-align:right;">Precio</th>
            <th style="padding:8px 12px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;">Total</td>
            <td style="padding:12px;text-align:right;font-weight:bold;color:#ec4899;">${formatCOP(order.total)}</td>
          </tr>
        </tfoot>
      </table>
      <h3 style="margin:24px 0 8px;font-size:15px;">Datos de entrega</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#71717a;width:110px;">Nombre</td><td>${escapeHtml(order.customerName)}</td></tr>
        <tr><td style="padding:4px 0;color:#71717a;">Correo</td><td>${escapeHtml(order.customerEmail)}</td></tr>
        <tr><td style="padding:4px 0;color:#71717a;">Teléfono</td><td>${escapeHtml(order.customerPhone)}</td></tr>
        <tr><td style="padding:4px 0;color:#71717a;">Dirección</td><td>${escapeHtml(order.customerAddress)}</td></tr>
        <tr><td style="padding:4px 0;color:#71717a;">Ciudad</td><td>${escapeHtml(order.customerCity)}</td></tr>
        ${order.notes ? `<tr><td style="padding:4px 0;color:#71717a;">Notas</td><td>${escapeHtml(order.notes)}</td></tr>` : ""}
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;text-align:center;">
        Este es un pedido por catálogo: el pago y la entrega se coordinan directamente con el vendedor.
      </p>
    </div>
  </div>`;
}

export async function sendOrderEmails(order: OrderEmailData): Promise<void> {
  const transport = getTransport();
  const from = `"MK Cosmetics" <${process.env.SMTP_USER}>`;
  const vendorEmail = process.env.VENDOR_EMAIL ?? process.env.SMTP_USER!;

  await Promise.all([
    transport.sendMail({
      from,
      to: order.customerEmail,
      subject: `Tu pedido ${order.code} en MK Cosmetics`,
      html: orderHtml(order, false),
    }),
    transport.sendMail({
      from,
      to: vendorEmail,
      replyTo: order.customerEmail,
      subject: `Nuevo pedido ${order.code} — ${order.customerName}`,
      html: orderHtml(order, true),
    }),
  ]);
}
