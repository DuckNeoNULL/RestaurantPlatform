import db from "../config/db.js";
import { toDTO, toDTOs } from '../utils/convert/dto.js';

// Model key from init-models is lowercase: restaurantimage
const { restaurantimage } = db;

class RestaurantImageDAO{
    static async getByRestaurantID(restaurantID){
        const rows = await restaurantimage.findAll({ where: { restaurantID }, attributes: ['imageID','restaurantID','imageURL'] });
        return toDTOs(rows);
    }

    static async getByID(imageID){
        const r = await restaurantimage.findByPk(imageID, { attributes: ['imageID','restaurantID','imageURL'] });
        return toDTO(r);
    }
    static async addImage(restaurantID, imageURL){
        const img = await restaurantimage.create({ restaurantID, imageURL });
        return toDTO(img);
    }
    
    static async deleteImage(imageID){
        const count = await restaurantimage.destroy({ where: { imageID } });
        return count > 0;
    }
}

export default RestaurantImageDAO;