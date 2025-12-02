const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payment', {
    paymentID: {
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
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    paymentMethod: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
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
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    released: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    refundedAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true,
      defaultValue: 0.00
    },
    refundReason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    refundDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refundTransactionRef: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "refundTransactionRef"
    },
    providerResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payment',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "paymentID" },
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
        name: "refundTransactionRef",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "refundTransactionRef" },
        ]
      },
      {
        name: "idx_payment_booking",
        using: "BTREE",
        fields: [
          { name: "bookingID" },
        ]
      },
      {
        name: "idx_payment_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_payment_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
