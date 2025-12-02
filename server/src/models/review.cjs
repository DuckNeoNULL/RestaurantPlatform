const Sequelize = require('sequelize');
const { default: restaurant } = require('./restaurant.cjs');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('review', {
    reviewID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bookingID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'booking',
        key: 'bookingID'
      }
    },
    customerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customer',
        key: 'customerID'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      
    }
  }, {
    sequelize,
    tableName: 'review',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "reviewID" },
        ]
      },
      {
        name: "bookingID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bookingID" },
          { name: "customerID" },
        ]
      },
      {
        name: "idx_review_booking",
        using: "BTREE",
        fields: [
          { name: "bookingID" },
        ]
      },
      {
        name: "idx_review_customer",
        using: "BTREE",
        fields: [
          { name: "customerID" },
        ]
      },
      {
        name: "idx_review_rating",
        using: "BTREE",
        fields: [
          { name: "rating" },
        ]
      },
    ]
  });
};
