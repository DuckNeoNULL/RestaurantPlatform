import db from "../config/db.js";
import {
  userRole,
  userStatus,
  negoStatus,
  coupleRole,
} from "../models/enums/UserStatus.js";
import { toDTO, toDTOs } from "../utils/convert/dto.js";

const sequelize = db.sequelize;
const UserModel = db.user;
const CustomerModel = db.customer;
const RestaurantPartnerModel = db.restaurantpartner;

class UserDAO {
  static async getAllUsers() {
    const users = await UserModel.findAll({
      include: [
        { model: RestaurantPartnerModel, as: "partner" },
        { model: CustomerModel, as: "customer" },
      ],
    });

    return toDTOs(users);
  }

  static async getUserById(id) {
    const user = await UserModel.findByPk(id, {
      include: [
        { model: RestaurantPartnerModel, as: "partner" },
        { model: CustomerModel, as: "customer" },
      ],
    });
    return user ? user.get({ plain: true }) : null;
  }

  static async createOwner(data) {
    const { email, fullName, phone, password, licenseUrl } = data;
    const t = await sequelize.transaction();

    try {
      // 1) Create user
      const createdUser = await UserModel.create(
        {
          email,
          fullName,
          phone,
          password,
          role: userRole.owner,
          status: userStatus.inactive,
        },
        { transaction: t }
      );

      // 2) Create partner
      await RestaurantPartnerModel.create(
        {
          restaurantPartnerID: createdUser.userID,
          licenseUrl: licenseUrl || "",
          status: negoStatus.pending,
          commissionRate: null,
        },
        { transaction: t }
      );

      await t.commit();
      return await this.getUserById(createdUser.userID);
    } catch (error) {
      await t.rollback();
      console.error("❌ createOwner failed:", error);
      throw error;
    }
  }

  static async createCustomer(data) {
    const { email, fullName, phone, password, partnerName, weddingRole } = data;

    // Dùng transaction nhưng chờ commit hoàn tất
    const t = await sequelize.transaction();

    try {
      const createdUser = await UserModel.create(
        {
          email,
          fullName,
          phone,
          password,
          role: userRole.customer,
          status: userStatus.inactive,
        },
        { transaction: t }
      );

      await CustomerModel.create(
        {
          customerID: createdUser.userID,
          partnerName: partnerName || "",
          weddingRole: weddingRole || coupleRole.other,
        },
        { transaction: t }
      );

      // 👉 chỉ chạy sau khi transaction COMMIT thành công
      let result;
      t.afterCommit(async () => {
        result = await this.getUserById(createdUser.userID);
      });

      await t.commit();

      // Trả về user sau khi commit
      return await this.getUserById(createdUser.userID);
    } catch (error) {
      await t.rollback();
      console.error("❌ createCustomer failed:", error);
      throw error;
    }
  }

  static async updateStatusUser(id, status) {
    const valid = status === 1;
    const [affected] = await UserModel.update(
      { status: valid },
      { where: { userID: id } }
    );
    if (affected === 0) throw new Error("User not found or status not updated");
    return affected > 0;
  }

  static async updateUserInfo(id, updates) {
    // updates may contain user fields and owner/customer specific fields
    const user = await UserModel.findByPk(id);
    if (!user) throw new Error("User not found");

    const {
      fullName,
      phone,
      password,
      role,
      status,
      licenseUrl,
      negotiationStatus,
      commissionRate,
      partnerName,
      weddingRole,
    } = updates;

    await user.update({
      fullName: fullName ?? user.fullName,
      phone: phone ?? user.phone,
      password: password ?? user.password,
      role: role ?? user.role,
      status: typeof status !== "undefined" ? status === 1 : user.status,
    });

    if ((role ?? user.role) === userRole.owner) {
      // upsert restaurant partner
      const rp = await RestaurantPartnerModel.findByPk(id);
      if (rp) {
        await rp.update({
          licenseUrl: licenseUrl ?? rp.licenseUrl,
          status:
            typeof negotiationStatus !== "undefined"
              ? negotiationStatus
              : rp.status,
          commissionRate:
            typeof commissionRate !== "undefined"
              ? commissionRate
              : rp.commissionRate,
        });
      } else {
        await RestaurantPartnerModel.create({
          restaurantPartnerID: id,
          licenseUrl: licenseUrl || "",
          status: negotiationStatus ?? negoStatus.pending,
          commissionRate: commissionRate || null,
        });
      }
    }

    if ((role ?? user.role) === userRole.customer) {
      const cu = await CustomerModel.findByPk(id);
      if (cu) {
        await cu.update({
          partnerName: partnerName ?? cu.partnerName,
          weddingRole: weddingRole ?? cu.weddingRole,
        });
      } else {
        await CustomerModel.create({
          customerID: id,
          partnerName: partnerName || "",
          weddingRole: weddingRole || coupleRole.other,
        });
      }
    }

    return this.getUserById(id);
  }

  static async deleteUser(id) {
    await RestaurantPartnerModel.destroy({
      where: { restaurantPartnerID: id },
    });
    await CustomerModel.destroy({ where: { customerID: id } });
    const affected = await UserModel.destroy({ where: { userID: id } });
    return affected > 0;
  }

  static async findByEmail(email, raw = false) {
    const user = await UserModel.findOne({ where: { email } });
    return raw ? user : toDTO(user);
  }
  static async getCustomers() {
    const customers = await UserModel.findAll({
      where: { role: userRole.customer },
      include: [{ model: CustomerModel, as: "customer" }],
    });
    return toDTOs(customers);
  }
  static async getOwners() {
    const owners = await UserModel.findAll({
      where: { role: userRole.owner },
      include: [{ model: RestaurantPartnerModel, as: "restaurantpartner" }],
    });
    return toDTOs(owners);
  }
  static async getInfoUserID(UserID) {
    const user = await UserModel.findByPk(UserID, {
      include: [
        { model: RestaurantPartnerModel, as: "restaurantpartner" },
        { model: CustomerModel, as: "customer" },
      ],
    });
    if (!user) return null;
    const plain = user.get({ plain: true });
    delete plain.password;
    return toDTO(plain);
  } 
  static async getPartnersByStatus(status) {
    const users = await UserModel.findAll({
      where: { role: 1 },
      include: [
        {
          model: RestaurantPartnerModel,
          as: "partner",
          where: { status },
          required: true,
        },
      ],
    });

    return users.map((u) => u.get({ plain: true }));
  }

  static async getApprovedPartners() {
    const { user, restaurantpartner } = db;

    const rows = await user.findAll({
      where: { role: 1 }, // role = 1 => partner/owner
      include: [
        {
          model: restaurantpartner,
          as: "partner",
          where: { status: 3 }, // 3 = approved
          required: true,
        },
      ],
    });

    return rows.map((r) => r.get({ plain: true }));
  }

  static async updatePartnerStatus(userID, status) {
    const affected = await RestaurantPartnerModel.update(
      { status },
      { where: { restaurantPartnerID: userID } }
    );

    if (affected[0] === 0) throw new Error("Partner not found");
    return true;
  }
}

export default UserDAO;
