const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('refundpolicy', {
    policyId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    daysBeforeEvent: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    refundPercent: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'refundpolicy',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "policyId" },
        ]
      },
      {
        name: "idx_refundpolicy_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantId" },
        ]
      },
    ]
  });
};
