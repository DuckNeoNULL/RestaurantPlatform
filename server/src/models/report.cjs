const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('report', {
    reportID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'userID'
      }
    },
    restaurantID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'restaurant',
        key: 'restaurantID'
      }
    },
    reviewID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'review',
        key: 'reviewID'
      }
    },
    targetType: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    reasonType: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'report',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "reportID" },
        ]
      },
      {
        name: "idx_report_user",
        using: "BTREE",
        fields: [
          { name: "userID" },
        ]
      },
      {
        name: "idx_report_restaurant",
        using: "BTREE",
        fields: [
          { name: "restaurantID" },
        ]
      },
      {
        name: "idx_report_review",
        using: "BTREE",
        fields: [
          { name: "reviewID" },
        ]
      },
      {
        name: "idx_report_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
