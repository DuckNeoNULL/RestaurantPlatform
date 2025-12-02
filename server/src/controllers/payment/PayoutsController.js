import PayoutsServices from '../../services/payment/PayoutsServices.js';
import PayoutsDAO from '../../dao/PayoutsDAO.js';

class PayoutsController {
  // POST /api/admin/payouts/send
  static async sendPayout(req, res) {
    try {
      const params = req.body || {};
      const result = await PayoutsServices.createAndSendPayout(params);
      return res.json(result);
    } catch (err) {
      console.error('[PayoutsController.sendPayout]', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/admin/payouts/process-pending
  // body: { payoutIds?: [id], bankAccountId?, initiatedBy? }
  static async processPending(req, res) {
    try {
      const { payoutIds = null, bankAccountId = null, initiatedBy = null } = req.body || {};
      let pendings = await PayoutsDAO.getPendingPayouts();
      if (Array.isArray(payoutIds) && payoutIds.length > 0) {
        const idSet = new Set(payoutIds.map(Number));
        pendings = pendings.filter(p => idSet.has(Number(p.payoutId)));
      }

      const results = [];
      for (const p of pendings) {
        // attempt to send existing payout
        const r = await PayoutsServices.sendExistingPayout(p, bankAccountId, initiatedBy);
        results.push({ payoutId: p.payoutId, result: r });
      }

      return res.json({ success: true, count: results.length, results });
    } catch (err) {
      console.error('[PayoutsController.processPending]', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default PayoutsController;
