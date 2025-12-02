const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hall', {
    hallID: {
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    minTable: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxTable: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "maxTable",
    },
    area: {
      type: DataTypes.DECIMAL(7,2),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'hall',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "hallID" },
        ]
      },
      {
        name: "idx_hall_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_hall_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_hall_capacity_price_status",
        using: "BTREE",
        fields: [
          { name: "minTable" },
          { name: "maxTable" },
          { name: "price" },
          { name: "status" },
        ]
      },
    ]
  });
};
