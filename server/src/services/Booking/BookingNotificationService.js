import BookingDAO from '../../dao/BookingDAO.js';
import { sendCustomerBookingEmail } from '../../utils/mail/mailer.js';
import BookingStatus from '../../models/enums/BookingStatus.js';

// Map transitions to audiences based on your rules
// PENDING -> partner
// ACCEPTED/REJECTED -> customer (reason for rejected)
// CONFIRMED -> partner
// EXPIRED -> partner
// DEPOSITED (tiền cọc thành công) -> partner
// COMPLETED -> customer (optional)
// CANCELLED -> partner (optional)

function statusToName(st) {
  if (typeof st === 'string') return st;
  // invert enum to get name from code
  const entry = Object.entries(BookingStatus).find(([, v]) => v === st);
  return entry ? entry[0] : String(st);
}

export async function notifyByStatus(booking, status, { reason } = {}) {
  const statusName = statusToName(status);
  // Only send emails to customers. Previously partner-targeted statuses
  // (PENDING, CONFIRMED, EXPIRED, DEPOSITED, CANCELLED) will not trigger
  // partner emails anymore. For statuses that used to target customers,
  // keep sending customer emails.
  switch (statusName) {
    case 'ACCEPTED':
      return { customer: await sendCustomerBookingEmail(booking, 'ACCEPTED') };
    case 'REJECTED':
      return { customer: await sendCustomerBookingEmail(booking, 'REJECTED', { reason }) };
    case 'COMPLETED':
      return { customer: await sendCustomerBookingEmail(booking, 'COMPLETED') };
    default:
      // No customer notification for other statuses
      return { info: `no-customer-email-for-status:${statusName}` };
  }
}

export async function notifyByStatusById(bookingID, status, { reason } = {}) {
  const booking = await BookingDAO.getBookingDetails(bookingID);
  if (!booking) return { error: 'Booking not found' };
  return notifyByStatus(booking, status, { reason });
}
