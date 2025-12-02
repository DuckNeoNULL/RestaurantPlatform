const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bookingdish', {
    bookingID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'booking',
        key: 'bookingID'
      }
    },
    dishID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'dish',
        key: 'dishID'
      }
    }
  }, {
    sequelize,
    tableName: 'bookingdish',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bookingID" },
          { name: "dishID" },
        ]
      },
      {
        name: "dishID",
        using: "BTREE",
        fields: [
          { name: "dishID" },
        ]
      },
    ]
  });
};
