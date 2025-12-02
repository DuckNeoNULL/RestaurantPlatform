const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('booking', {
    bookingID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customerID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customer',
        key: 'customerID'
      }
    },
    eventTypeID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'eventtype',
        key: 'eventTypeID'
      }
    },
    hallID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hall',
        key: 'hallID'
      }
    },
    menuID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'menu',
        key: 'menuID'
      }
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    tableCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    specialRequest: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    originalPrice: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true,
      defaultValue: 0.00
    },
    VAT: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    isChecked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'booking',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bookingID" },
        ]
      },
      {
        name: "menuID",
        using: "BTREE",
        fields: [
          { name: "menuID" },
        ]
      },
      {
        name: "idx_booking_customer",
        using: "BTREE",
        fields: [
          { name: "customerID" },
        ]
      },
      {
        name: "idx_booking_eventType",
        using: "BTREE",
        fields: [
          { name: "eventTypeID" },
        ]
      },
      {
        name: "idx_booking_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_booking_hall_datetime",
        using: "BTREE",
        fields: [
          { name: "hallID" },
          { name: "eventDate" },
          { name: "startTime" },
          { name: "endTime" },
          { name: "status" },
        ]
      },
    ]
  });
};
