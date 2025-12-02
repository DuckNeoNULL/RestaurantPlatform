const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payouts', {
    payoutId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payment',
        key: 'paymentID'
      }
    },
    restaurantPartnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurantpartner',
        key: 'restaurantPartnerID'
      }
    },
    grossAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    payoutAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    method: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    transactionRef: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "transactionRef"
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    releasedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'userID'
      }
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payouts',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "payoutId" },
        ]
      },
      {
        name: "transactionRef",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "transactionRef" },
        ]
      },
      {
        name: "fk_payout_releasedBy",
        using: "BTREE",
        fields: [
          { name: "releasedBy" },
        ]
      },
      {
        name: "idx_payout_payment",
        using: "BTREE",
        fields: [
          { name: "paymentId" },
        ]
      },
      {
        name: "idx_payout_restaurantPartner",
        using: "BTREE",
        fields: [
          { name: "restaurantPartnerId" },
        ]
      },
      {
        name: "idx_payout_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
