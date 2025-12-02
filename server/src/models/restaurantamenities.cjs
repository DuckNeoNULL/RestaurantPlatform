const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('restaurantamenities', {
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    amenityID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'amenity',
        key: 'amenityID'
      }
    }
  }, {
    sequelize,
    tableName: 'restaurantamenities',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
          { name: "amenityID" },
        ]
      },
      {
        name: "idx_restaurantAmenities_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_restaurantAmenities_amenity",
        using: "BTREE",
        fields: [
          { name: "amenityID" },
        ]
      },
    ]
  });
};
