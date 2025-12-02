const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('restauranteventtype', {
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    eventTypeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'eventtype',
        key: 'eventTypeID'
      }
    }
  }, {
    sequelize,
    tableName: 'restauranteventtype',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
          { name: "eventTypeID" },
        ]
      },
      {
        name: "idx_restaurantEventType_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_restaurantEventType_eventType",
        using: "BTREE",
        fields: [
          { name: "eventTypeID" },
        ]
      },
      {
        name: "idx_restaurant_eventtype",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
          { name: "eventTypeID" },
        ]
      },
    ]
  });
};
