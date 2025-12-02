import RestaurantService from "../services/RestaurantServices.js";

class RestaurantController {
  static async getAll(req, res) {
    try {
      const data = await RestaurantService.getAll();
      res.json(data);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching Restaurant", error: err.message });
    }
  }

  static async getByPartner(req, res) {
    try {
      const { partnerID } = req.params;
      const restaurants = await RestaurantService.getByPartnerID(partnerID);
      res.json(restaurants);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching restaurant", error: err.message });
    }
  }

  static async getAvailable(req, res) {
    try {
      const data = await RestaurantService.getAvailable();
      res.json(data);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching restaurant", error: err.message });
    }
  }

  static async getOne(req, res) {
    try {
      const restaurant = await RestaurantService.getByID(req.params.id);
      if (!restaurant)
        return res.status(404).json({ message: "Restaurant not found" });
      res.json(restaurant);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching restaurant", error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const newRestaurant = await RestaurantService.create(req.body);
      res.status(201).json(newRestaurant);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error creating restaurant", error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const updated = await RestaurantService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating restaurant", error: err.message });
    }
  }

  static async changeRestaurantStatus(req, res) {
    try {
      const id = req.params.id;
      console.log(`[RestaurantController] changeRestaurantStatus called for id=${id}`);
      const success = await RestaurantService.changeRestaurantStatus(id);
      console.log(`[RestaurantController] changeRestaurantStatus result for id=${id}:`, success);
      if (!success) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      // Return a JSON body so client can parse response easily
      return res.status(200).json({ success: true, restaurantID: id });
    } catch (err) {
      console.error("[RestaurantController] Error in changeRestaurantStatus:", err);
      return res
        .status(500)
        .json({ message: "Error toggling restaurant status", error: err.message, stack: err.stack });
    }
  }

  static async addImage(req, res) {
    try {
      const { id } = req.params;
      const { imageURL } = req.body;
      const image = await RestaurantService.addImage(id, imageURL);
      res.status(201).json(image);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteImage(req, res) {
    try {
      const { imageID } = req.params;
      const success = await RestaurantService.deleteImage(imageID);
      if (!success)
        return res.status(500).json({ message: "Image not found" });
      res.json("Success");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async search(req,res){
    try{
      const  {location,capacity,date,minPrice,maxPrice} = req.query;

      const results = await RestaurantService.search({
        location,
        capacity : capacity ? parseInt(capacity) : null,
        date,
        minPrice : minPrice ? parseFloat(minPrice) : null,
        maxPrice : maxPrice ? parseFloat(maxPrice) : null,
      });
      res.json(results)
    }catch(err){
      res.status(500).json({message : "Error searching restaurants", error : err.message});
    }
  }
  static async getTopBookedRestaurants(req, res) {
    try {
      console.log("Received request for top booked restaurants with query:", req.query);
      const lim = Number(req.query?.limit);
      const limit = Number.isFinite(lim) && lim > 0 ? lim : undefined;
      const restaurants = await RestaurantService.getTopBookedRestaurants(limit);
      res.json(restaurants);
    } catch (err) {
      console.error("❌ Error in RestaurantController.search:", err);
      res.status(500).json({
        message: "Error searching restaurants",
        error: err.message,
      });
    }
  }
  static async getTopRatedRestaurants(req, res) {
    try {
      console.log("Received request for top rated restaurants with query:", req.query);
      const lim = Number(req.query?.limit);
      const limit = Number.isFinite(lim) && lim > 0 ? lim : undefined;
      const restaurants = await RestaurantService.getTopRatedRestaurants(limit);
      res.json(restaurants);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching top rated restaurants', error: err.message });
    }
  }
}

export default RestaurantController;
