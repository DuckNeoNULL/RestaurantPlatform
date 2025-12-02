const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('restaurant', {
    restaurantID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    restaurantPartnerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurantpartner',
        key: 'restaurantPartnerID'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    hallCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    addressID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'address',
        key: 'addressID'
      }
    },
    thumbnailURL: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avgRating: {
      type: DataTypes.DECIMAL(2,1),
      allowNull: true,
      defaultValue: 0.0
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'restaurant',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_restaurant_partner",
        using: "BTREE",
        fields: [
          { name: "restaurantPartnerID" },
        ]
      },
      {
        name: "idx_restaurant_address",
        using: "BTREE",
        fields: [
          { name: "addressID" },
        ]
      },
      {
        name: "idx_restaurant_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_restaurant_address_status",
        using: "BTREE",
        fields: [
          { name: "addressID" },
          { name: "status" },
        ]
      },
    ]
  });
};
