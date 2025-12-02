import HallServices from "../services/HallServices.js";
import { normalizeTime } from "../utils/timeUtils.js";
class HallController {
    static async createHall(req, res) {
        try {
            const hallData = req.body;
            if (!hallData) {
                return res.status(400).json({ error: 'Request body cannot be null' });
            }
            const newHall = await HallServices.createHall(hallData);
            res.status(201).json(newHall);
        } catch (error) {
            console.error('Error creating hall:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async getHallById(req, res) {
        try {
            const hall = await HallServices.getHallById(req.params.id);
            if (!hall) {
                return res.status(404).json({ error: 'Hall not found' });
            }
            res.json(hall);
        } catch (error) {
            console.error('Error fetching hall by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async getHallsByRestaurantId(req, res) {
        try {
            const halls = await HallServices.getHallsByRestaurantId(req.params.restaurantId);
            res.json(halls);
        } catch (error) {
            console.error('Error fetching halls by restaurant ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updateHall(req, res) {
        try {
            const hallData = req.body;
            const updatedHall = await HallServices.updateHall(req.params.id, hallData);
            res.json(updatedHall);
        } catch (error) {
            console.error('Error updating hall:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async deleteHall(req, res) {
        try {
            const success = await HallServices.deleteHall(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Hall not found' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting hall:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updateHallStatus(req, res) {
        try {
            const { status } = req.body;
            const updatedHall = await HallServices.updateHallStatus(req.params.id, status);
            if (!updatedHall) {
                return res.status(404).json({ error: 'Hall not found' });
            }
            res.json(updatedHall);
        } catch (error) {
            console.error('Error updating hall status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async addHallImage(req, res) {
        try {
            const { imageURL, hallID } = req.body;
            if (!imageURL || !hallID) {
                return res.status(400).json({ error: 'Image URL and Hall ID cannot be null' });
            }
            const newImage = await HallServices.addHallImage(hallID, imageURL);
            res.status(201).json(newImage);
        } catch (error) {
            console.error('Error adding hall image:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async getHallImages(req, res) {
        try {
            const images = await HallServices.getHallImages(req.params.id);
            res.json(images);
        } catch (error) {
            console.error('Error fetching hall images:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async deleteHallImage(req, res) {
        try {
            const success = await HallServices.deleteHallImage(req.params.imageId);
            if (!success) {
                return res.status(404).json({ error: 'Image not found' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting hall image:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async getAvailability(req, res) {
        try {
            const { date: eventDate, startTime, endTime } = req.query;
            const hallID = req.params.id;
            if (!eventDate || !startTime || !endTime) {
                return res.status(400).json({ error: 'Missing date/startTime/endTime' });
            }
            // Normalize time format
            const normalizedStartTime = normalizeTime(startTime);
            const normalizedEndTime = normalizeTime(endTime);
            const result = await HallServices.isHallAvailable(hallID, eventDate, normalizedStartTime, normalizedEndTime);
            res.json(result);
        } catch (error) {
            console.error('Error checking hall availability:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async getAvailableHalls(req, res) {
        try {
            const { date: eventDate, startTime, endTime, restaurantId, maxTable } = req.query;
            if (!restaurantId) {
                return res.status(400).json({ error: 'Missing restaurantId' });
            }
            if (maxTable && isNaN(parseInt(maxTable))) {
                return res.status(400).json({ error: 'maxTable must be a number' });
            }
            let halls;
            if (eventDate && startTime && endTime) {
                console.log('Date/time provided, checking availability for restaurant:', restaurantId);
                // Normalize time format
                const normalizedStartTime = normalizeTime(startTime);
                const normalizedEndTime = normalizeTime(endTime);
                halls = await HallServices.listAvailableHalls(restaurantId, eventDate, normalizedStartTime, normalizedEndTime, maxTable);
            } else {
                console.log('No complete date/time provided, fetching all active halls for restaurant:', restaurantId);
                halls = await HallServices.getHallsByRestaurantId(restaurantId);
                // Filter to only active halls
                halls = halls.filter(hall => hall.status === true);
                // Filter by maxTable if provided
                if (maxTable) {
                    halls = halls.filter(hall => hall.maxTable >= maxTable);
                }
            }

            // Load images for each hall
            const hallsWithImages = await Promise.all(
                halls.map(async (hall) => {
                    try {
                        const images = await HallServices.getHallImages(hall.hallID);
                        return {
                            ...hall,
                            images: images || []
                        };
                    } catch (error) {
                        console.error(`Error loading images for hall ${hall.hallID}:`, error);
                        return {
                            ...hall,
                            images: []
                        };
                    }
                })
            );

            res.json(hallsWithImages);
        } catch (error) {
            console.error('Error fetching available halls:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
export default HallController;