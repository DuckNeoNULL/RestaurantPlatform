const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('promotion', {
    promotionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    minTable: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    discountType: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    discountValue: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'promotion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "promotionID" },
        ]
      },
      {
        name: "idx_promotion_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_promotion_start_end",
        using: "BTREE",
        fields: [
          { name: "startDate" },
          { name: "endDate" },
        ]
      },
      {
        name: "idx_promotion_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
