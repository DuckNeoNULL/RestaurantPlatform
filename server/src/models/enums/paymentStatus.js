class PaymentStatus {
     type = {
         DEPOSIT: 0,
         REMAINING: 1,
         REFUND: 2,
     };
     paymentMethod = {
        // -- 0: PAYOS, 1: BANK_TRANSFER, 2: CARD, 3: CASH
        PAYOS: 0,
        BANK_TRANSFER: 1,
        CARD: 2,
        CASH: 3,
     };

    //  -- 0: PENDING, 1: PROCESSING, 2: SUCCESS, 3: FAILED, 4: REFUNDED, 5: CANCELLED
     status = {
        PENDING: 0,
        PROCESSING: 1,
        SUCCESS: 2,
        FAILED: 3,
        REFUNDED: 4,
        CANCELLED: 5,
     };
}
export const paymentStatus = new PaymentStatus();