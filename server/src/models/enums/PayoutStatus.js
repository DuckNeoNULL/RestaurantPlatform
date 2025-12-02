
// Enum-like object describing payout methods and statuses.
// Exported both as default and as a named export to match existing import styles
// across the codebase (some files use default import, others use named import).
const PayoutStatus = {
   method: {
      PAYOS: 0,
      BANK_TRANSFER: 1,
      CARD: 2,
      CASH: 3,
   },
   status: {
      PENDING: 0,
      PROCESSING: 1,
      COMPLETED: 2,
      FAILED: 3,
      CANCELLED: 4,
   },
};

export default PayoutStatus;
export { PayoutStatus };