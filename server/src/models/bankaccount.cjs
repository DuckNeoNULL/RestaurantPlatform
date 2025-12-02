const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bankaccount', {
    accountID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    restaurantPartnerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurantpartner',
        key: 'restaurantPartnerID'
      }
    },
    bankName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    accountHolder: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    branch: {
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
    tableName: 'bankaccount',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accountID" },
        ]
      },
      {
        name: "restaurantPartnerID",
        using: "BTREE",
        fields: [
          { name: "restaurantPartnerID" },
        ]
      },
    ]
  });
};
