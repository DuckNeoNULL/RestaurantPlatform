import nodemailer from 'nodemailer';
import { bookingAcceptedTemplate, bookingRejectedTemplate } from './mailCustomerTemplates.js';
// Create a singleton transporter using ENV variables
let transporter;

function getBoolean(value, def = false) {
  if (value === undefined || value === null) return def;
  const v = String(value).toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    SMTP_SECURE,
    SMTP_FROM,
  } = process.env;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: getBoolean(SMTP_SECURE, false),
    auth: GMAIL_USER && GMAIL_APP_PASSWORD ? { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } : undefined,
  });

  transporter._defaultFrom = SMTP_FROM || GMAIL_USER || 'no-reply@example.com';
  return transporter;
}

export async function sendEmail({ to, subject, text, html, from }) {
  const t = getTransporter();
  const mailOptions = {
    from: from || t._defaultFrom,
    to,
    subject,
    text,
    html,
  };
  return await t.sendMail(mailOptions);
}

export async function sendBookingStatusEmail(to, booking, status, { reason } = {}) {
  let subject = `Your booking update`;
  let html = '';
  let text = '';

  if (status === 'ACCEPTED') {
    const tpl = bookingAcceptedTemplate(booking);
    subject = tpl.subject; html = tpl.html; text = tpl.text;
  } else if (status === 'REJECTED') {
    const tpl = bookingRejectedTemplate(booking, reason);
    subject = tpl.subject; html = tpl.html; text = tpl.text;
  } else {
    // Fallback generic template
    const { bookingID, eventDate, startTime, endTime } = booking || {};
    subject = `Your booking #${bookingID} has been ${String(status).toLowerCase()}`;
    const lines = [
      `Booking ID: ${bookingID}`,
      `Time: ${eventDate || ''} ${startTime || ''} - ${endTime || ''}`,
      `Status: ${status}`
    ];
    text = lines.join('\n');
    html = lines.map(l => `<p>${l}</p>`).join('');
  }

  try {
    await sendEmail({ to, subject, text, html });
    return true;
  } catch (err) {
    console.error('Failed to send booking status email:', err?.message || err);
    return false;
  }
}

// --- New helpers: separate customer vs partner emails ---

function resolveCustomerEmail(booking, explicit) {
  // Prefer explicit target, then nested customer.user.email, then customer.email, then any booking-level override
  return (
    explicit ||
    booking?.customer?.user?.email ||
    booking?.customer?.email ||
    booking?.customerEmail ||
    null
  );
}


export async function sendCustomerBookingEmail(booking, status, { to, reason } = {}) {
  const target = resolveCustomerEmail(booking, to);
  if (!target) {
    console.warn('sendCustomerBookingEmail: missing customer email. Provide `to` explicitly.');
    return false;
  }

  let subject = `Cập nhật đơn đặt tiệc`;
  let html = '';
  let text = '';

  if (status === 'ACCEPTED') {
    const tpl = bookingAcceptedTemplate(booking);
    subject = tpl.subject; html = tpl.html; text = tpl.text;
  } else if (status === 'REJECTED') {
    const tpl = bookingRejectedTemplate(booking, reason);
    subject = tpl.subject; html = tpl.html; text = tpl.text;
  } else {
    const { bookingID, eventDate, startTime, endTime } = booking || {};
    subject = `Đơn đặt tiệc #${bookingID} đã được cập nhật (${String(status).toLowerCase()})`;
    const lines = [
      `Mã đơn: ${bookingID}`,
      `Thời gian: ${eventDate || ''} ${startTime || ''} - ${endTime || ''}`,
      `Trạng thái: ${status}`,
    ];
    text = lines.join('\n');
    html = lines.map((l) => `<p>${l}</p>`).join('');
  }

  try {
    await sendEmail({ to: target, subject, text, html });
    return true;
  } catch (err) {
    console.error('Failed to send customer booking email:', err?.message || err);
    return false;
  }
}


// Convenience: send emails to intended audiences based on partner template `target`
// Convenience: only send customer emails. Partner emails are intentionally removed.
export async function sendBookingStatusEmails(booking, status, { customerEmail, reason } = {}) {
  const results = { customer: null };
  results.customer = await sendCustomerBookingEmail(booking, status, { to: customerEmail, reason });
  return results;
}
