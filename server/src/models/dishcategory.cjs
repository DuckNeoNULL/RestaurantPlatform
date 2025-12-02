const Sequelize = require('sequelize');
const { default: restaurant } = require('./restaurant.cjs');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dishcategory', {
    categoryID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "name"
    },
    requiredQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    }
  }, {
    sequelize,
    tableName: 'dishcategory',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "categoryID" },
        ]
      },
      {
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
};
