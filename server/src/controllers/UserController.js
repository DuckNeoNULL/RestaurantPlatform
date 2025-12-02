import UserService from "../services/userServices.js";
class UserController {
  static async getAllUsers(req, res) {
    try {
      const userList = await UserService.getAllUsers();
      res.json(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getOwners(req, res) {
    try {
      const owners = await UserService.getAllOwners();
      res.json(owners);
    } catch (error) {
      console.error("Error fetching owners:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getCustomers(req, res) {
    try {
      const customers = await UserService.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateUser(req, res) {
    try {
      const userData = req.body;
      const updatedUser = await UserService.updateUser(req.params.id, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const success = await UserService.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  static async updateUserStatus(req, res) {
    try {
      const { status } = req.body;
      const userId = req.params.id;

      // CHỈ check null hoặc undefined
      if (status == null) {
        return res.status(400).json({ error: "Status is required" });
      }

      const updatedUser = await UserService.updateUserStatus(userId, status);
      return res.json({ success: true, data: updatedUser });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getPendingPartners(req, res) {
    try {
      const list = await UserService.getPendingPartners();
      res.json({ success: true, data: list });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getNegotiatingPartners(req, res) {
    try {
      const list = await UserService.getNegotiatingPartners();
      res.json({ success: true, data: list });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getApprovedPartners(req, res) {
    try {
      const list = await UserService.getApprovedPartners();
      res.json({ success: true, data: list });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async approvePartner(req, res) {
    try {
      const updated = await UserService.approvePartner(req.params.id);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async rejectPartner(req, res) {
    try {
      const updated = await UserService.rejectPartner(req.params.id);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
  static async activatePartner(req, res) {
    try {
      const updated = await UserService.activatePartner(req.params.id);
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error("Activate partner error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default UserController;
