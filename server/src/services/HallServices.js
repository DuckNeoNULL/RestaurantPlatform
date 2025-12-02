import HallDAO from "../dao/HallDAO.js";
import HallImageDAO from "../dao/HallImageDAO.js";
import BookingDAO from "../dao/BookingDAO.js";
class HallServices {
    static async createHall(hallData) {
        if (!hallData) {
            throw new Error('Hall data cannot be null');
        }
        const newHall = await HallDAO.createHall(hallData);
        return newHall;
    }
    static async getHallById(hallID) {
        if (!hallID) {
            throw new Error('Hall ID cannot be null');
        }
        const hall = await HallDAO.getHallById(hallID);
        if (!hall) {
            throw new Error('Hall not found');
        }
        return hall;
    }
    static async getHallsByRestaurantId(restaurantID) {
        if (!restaurantID) {
            throw new Error('Restaurant ID cannot be null');
        }
        const halls = await HallDAO.getHallsByRestaurantId(restaurantID);
        return halls;
    }
    static async updateHall(hallID, hallData) {
        if (!hallData || !hallID) {
            throw new Error('Hall data or Hall ID cannot be null');
        }
        const updatedHall = await HallDAO.updateHall(hallID, hallData);
        return updatedHall;
    }
    static async deleteHall(hallID) {
        if (!hallID) {
            throw new Error('Hall ID cannot be null');
        }
        const success = await HallDAO.deleteHall(hallID);
        return success;
    }
    static async updateHallStatus(hallID, status) {
        if (!hallID) {
            throw new Error('Hall ID cannot be null');
        }
        const updatedHall = await HallDAO.updateHallStatus(hallID, status);
        return updatedHall;
    }
    static async addHallImage(hallID, imageURL) {
        if (!hallID || !imageURL) {
            throw new Error('Hall ID or Image URL cannot be null');
        }
        const newImage = await HallImageDAO.createHallImage(hallID, imageURL);
        return newImage;
    }
    static async getHallImages(hallID) {
        if (!hallID) {
            throw new Error('Hall ID cannot be null');
        }
        const images = await HallImageDAO.getByHallId(hallID);
        return images;
    }
    static async deleteHallImage(imageID) {
        if (!imageID) {
            throw new Error('Image ID cannot be null');
        }
        const success = await HallImageDAO.deleteHallImage(imageID);
        return success;
    }
    /**
     * Check if a hall is available for a given date/time range.
     * Returns { available: boolean, overlaps: number }
     */
    static async isHallAvailable(hallID, eventDate, startTime, endTime) {
        if (!hallID || !eventDate || !startTime || !endTime) {
            throw new Error('Missing parameters for availability check');
        }
        // Reuse BookingDAO overlap check for blocking statuses
        const overlaps = await BookingDAO.findByHallAndTime(hallID, eventDate, startTime, endTime);
        console.log("Overlaps:", overlaps);
        return { available: overlaps.length === 0, overlaps: overlaps.length };
    }
    
    static async listAvailableHalls(restaurantID, eventDate, startTime, endTime, requiredTables) {
        if (!restaurantID || !eventDate || !startTime || !endTime) {
            throw new Error('Missing parameters for listing available halls');
        }
        const halls = await HallDAO.getHallsByRestaurantId(restaurantID);
        const availableHalls = [];
        for (const hall of halls) {
            // If requiredTables is provided, skip halls that don't fit the [minTable, maxTable] range
            if (requiredTables != null) {
                const min = Number(hall.minTable ?? 0);
                const max = Number(hall.maxTable ?? Infinity);
                const req = Number(requiredTables);

                // Normalize bit/boolean/number/string representations of status to 0/1
                const statusValue = (typeof hall.status === 'boolean') ? (hall.status ? 1 : 0) : Number(hall.status);

                if (req < min || req > max || statusValue !== 1) {
                    continue;
                }
            }
            const availability = await this.isHallAvailable(hall.hallID, eventDate, startTime, endTime);
            if (availability.available) {
                availableHalls.push(hall);
            }
        }
        return availableHalls;
    }
}

export default HallServices;