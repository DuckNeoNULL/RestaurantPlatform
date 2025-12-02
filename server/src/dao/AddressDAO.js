import db from "../config/db.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';
const { address } = db;
class AddressDAO{
    static async getByID(addressID){
        const r = await address.findByPk(addressID);
        return toDTO(r);
    }
    static async getAllAddress(addressData){
        const rows = await address.findAll();
        return toDTOs(rows);
    }
}

export default AddressDAO;