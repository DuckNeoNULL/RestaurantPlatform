const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('promotionservice', {
    promotionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'promotion',
        key: 'promotionID'
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
    }
  }, {
    sequelize,
    tableName: 'promotionservice',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "promotionID" },
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
