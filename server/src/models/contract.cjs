const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contract', {
    contractID: {
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
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    fileOriginalUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    filePartnerSignedUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fileCustomerSignedUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    partnerSignedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    customerSignedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'contract',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "contractID" },
        ]
      },
      {
        name: "idx_contract_booking",
        using: "BTREE",
        fields: [
          { name: "bookingID" },
        ]
      },
      {
        name: "idx_contract_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
