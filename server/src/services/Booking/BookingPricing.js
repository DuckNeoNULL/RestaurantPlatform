// Pricing engine to calculate booking costs
// Usage:
// const engine = new BookingPricing({ tableCount, services });
// await engine.calculateBasePrice(hall, menu);
// await engine.applyPromotions(promotions);
// await engine.applyPaidServices(allServices);
// await engine.calculateTotals({ VAT_RATE: '0.08' });
// -> engine.originalPrice, engine.discountAmount, engine.VAT, engine.totalAmount, engine.services (priced)

export default class BookingPricing {
  #freeServices = new Set();
  #vatRate = 0.08;

  constructor({ tableCount = 0, services = [] } = {}) {
    this.tableCount = Number(tableCount) || 0;
    this.services = Array.isArray(services) ? services : [];
    this.promotions = [];
    this.originalPrice = 0;
    this.discountAmount = 0;
    this.VAT = 0;
    this.totalAmount = 0;
  }

  async calculateBasePrice(hall, menu, promotions = []) {
  const hallPrice = Number(hall?.price);
  const menuPrice = Number(menu?.price);
  const tableCount = Number(this.tableCount);

  if (isNaN(hallPrice) || isNaN(menuPrice)) {
    throw new Error('Hall or menu price must be a number.');
  }
  if (isNaN(tableCount)) {
    throw new Error('tableCount must be a number.');
  }

  const rawPrice = hallPrice + (menuPrice * tableCount);
  this.originalPrice = rawPrice >= 1000 ? Math.floor(rawPrice / 1000) * 1000 : 0;

  // Calculate discount for percent promotions (discountType = 0)
  this.discountAmount = 0;
  if (Array.isArray(promotions)) {
    for (const promo of promotions) {
      if (!promo || typeof promo !== 'object') continue;
      const minTable = Number(promo.minTable || 0);
      if (this.tableCount >= minTable && (promo.discountType === 0 || promo.discountType === 'Percent') && typeof promo.discountValue === 'number') {
        const rawDiscount = this.originalPrice * (promo.discountValue / 100);
        const discount = rawDiscount >= 1000 ? Math.floor(rawDiscount / 1000) * 1000 : 0;
        this.discountAmount += discount;
      }
    }
  }
}


  async applyPromotions(promotions) {
    if (!Array.isArray(promotions)) {
      throw new TypeError('promotions must be an array');
    }
    this.promotions = [];

    for (const promo of promotions) {
      if (!promo || typeof promo !== 'object') continue;
      const minTable = Number(promo.minTable || 0);
      if (this.tableCount >= minTable) {
        // Free service by ID (can be provided multiple times via separate promo entries)
        if ((promo.discountType === 1 || promo.discountType === 'Free') && promo.freeServiceID) {
          this.promotions.push(promo);
          this.#freeServices.add(promo.freeServiceID);
        }
      }
    }
  }

  async applyPaidServices(allServices) {
    const list = Array.isArray(allServices) ? allServices : [];
    const map = new Map(list.map((s) => [s.serviceID, s]));
    const paid = [];
    for (const s of this.services) {
      const sid = s?.serviceID;
      const qty = Number(s?.quantity) || 1;
      if (!sid) continue;
      if (this.#freeServices.has(sid)) {
        // If free, skip charging
        continue;
      }
      const info = map.get(sid);
      if (!info) throw new Error(`Service ID ${sid} not found.`);
      const price = Number(info.price) * qty;
      if (isNaN(price)) throw new Error(`Invalid price for service ID ${sid}.`);
      this.originalPrice += price;
      paid.push({ serviceID: sid, quantity: qty, appliedPrice: Number(info.price) });
    }
    this.services = paid;
  }

  async calculateTotals(systemSettings = {}) {
    this.#vatRate = parseFloat(systemSettings?.VAT_RATE ?? '0.08');
    if (isNaN(this.#vatRate) || this.#vatRate < 0) this.#vatRate = 0.08;
    if (typeof this.originalPrice !== 'number') throw new Error('originalPrice must be a number.');
    if (typeof this.discountAmount !== 'number') throw new Error('discountAmount must be a number.');
    const afterDiscount = this.originalPrice - this.discountAmount;
    const rawVAT = afterDiscount * this.#vatRate;
    this.VAT = rawVAT >= 1000 ? Math.floor(rawVAT / 1000) * 1000 : 0;
    const rawTotal = afterDiscount + this.VAT;
    this.totalAmount = rawTotal >= 1000 ? Math.floor(rawTotal / 1000) * 1000 : 0;
    if (this.totalAmount < 0) this.totalAmount = 0;
  }
}
