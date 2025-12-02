const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dish', {
    dishID: {
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
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dishcategory',
        key: 'categoryID'
      }
    },
    imageURL: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'dish',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "dishID" },
        ]
      },
      {
        name: "categoryID",
        using: "BTREE",
        fields: [
          { name: "categoryID" },
        ]
      },
      {
        name: "restaurantID",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
    ]
  });
};
