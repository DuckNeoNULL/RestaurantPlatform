import BankAccountService from '../services/BankAccountService.js';

class BankAccountController {
  static async create(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const payload = req.body;
      const created = await BankAccountService.createForPartner(actorUserId, payload);
      res.status(201).json(created);
    } catch (err) {
      console.error('BankAccount create error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async list(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const rows = await BankAccountService.listForPartner(actorUserId);
      res.json(rows);
    } catch (err) {
      console.error('BankAccount list error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async get(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const accountID = req.params.id;
      const row = await BankAccountService.getByIDForPartner(actorUserId, accountID);
      res.json(row);
    } catch (err) {
      console.error('BankAccount get error', err);
      res.status(404).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const accountID = req.params.id;
      const patch = req.body;
      const updated = await BankAccountService.updateForPartner(actorUserId, accountID, patch);
      res.json(updated);
    } catch (err) {
      console.error('BankAccount update error', err);
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const actorUserId = req.user?.userId;
      const accountID = req.params.id;
      const ok = await BankAccountService.deleteForPartner(actorUserId, accountID);
      if (!ok) return res.status(404).json({ error: 'Not found or not authorized' });
      res.json({ success: true });
    } catch (err) {
      console.error('BankAccount delete error', err);
      res.status(400).json({ error: err.message });
    }
  }
}

export default BankAccountController;
