const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bookingpromotion', {
    bookingID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'booking',
        key: 'bookingID'
      }
    },
    promotionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'promotion',
        key: 'promotionID'
      }
    }
  }, {
    sequelize,
    tableName: 'bookingpromotion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bookingID" },
          { name: "promotionID" },
        ]
      },
      {
        name: "promotionID",
        using: "BTREE",
        fields: [
          { name: "promotionID" },
        ]
      },
    ]
  });
};
