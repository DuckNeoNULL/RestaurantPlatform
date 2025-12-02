const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service', {
    serviceID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    eventTypeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'eventtype',
        key: 'eventTypeID'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'service',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "serviceID" },
        ]
      },
      {
        name: "eventTypeID",
        using: "BTREE",
        fields: [
          { name: "eventTypeID" },
        ]
      },
      {
        name: "idx_service_rest_event",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
          { name: "eventTypeID" },
        ]
      },
      {
        name: "idx_service_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
