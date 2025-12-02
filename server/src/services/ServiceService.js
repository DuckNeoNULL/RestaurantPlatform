import db from '../config/db.js';
import ServiceDAO from '../dao/ServiceDAO.js';
import RestaurantDAO from '../dao/RestaurantDAO.js';

const { service } = db;

class ServiceService {
  static async createForPartner(actorUserId, { restaurantID, eventTypeID, name, price, unit, status = true }) {
    if (!restaurantID) throw new Error('restaurantID required');
    if (!eventTypeID) throw new Error('eventTypeID required');
    const r = await RestaurantDAO.getByID(restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    const s = await service.create({ restaurantID, eventTypeID, name, price, unit, status });
    return { serviceID: s.serviceID, restaurantID: s.restaurantID, eventTypeID: s.eventTypeID, name: s.name, price: s.price, unit: s.unit, status: s.status };
  }

  static async updateForPartner(actorUserId, serviceID, patch) {
    const existing = await ServiceDAO.getByID(serviceID);
    if (!existing) throw new Error('Service not found');
    const r = await RestaurantDAO.getByID(existing.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    const updatable = {};
    ['name','price','unit','status','eventTypeID'].forEach(k => { if (k in patch) updatable[k] = patch[k]; });
    const ok = await ServiceDAO.updateService(serviceID, updatable);
    if (!ok) throw new Error('Update failed');
    return await ServiceDAO.getByID(serviceID);
  }

  static async deleteForPartner(actorUserId, serviceID) {
    const existing = await ServiceDAO.getByID(serviceID);
    if (!existing) throw new Error('Service not found');
    const r = await RestaurantDAO.getByID(existing.restaurantID);
    if (!r) throw new Error('Restaurant not found');
    if (String(r.restaurantPartnerID) !== String(actorUserId)) throw new Error('Not authorized');

    return await ServiceDAO.deleteService(serviceID);
  }

  static async listByRestaurant(restaurantID) {
    return await ServiceDAO.getByRestaurantID(restaurantID);
  }
}

export default ServiceService;
