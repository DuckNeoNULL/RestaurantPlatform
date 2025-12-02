const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bookingservice', {
    bookingID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'booking',
        key: 'bookingID'
      }
    },
    serviceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'service',
        key: 'serviceID'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    appliedPrice: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'bookingservice',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bookingID" },
          { name: "serviceID" },
        ]
      },
      {
        name: "serviceID",
        using: "BTREE",
        fields: [
          { name: "serviceID" },
        ]
      },
    ]
  });
};
