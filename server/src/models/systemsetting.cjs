const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('systemsetting', {
    settingID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    category: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    settingKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "settingKey"
    },
    settingName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    settingValue: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    dataType: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'userID'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'userID'
      }
    }
  }, {
    sequelize,
    tableName: 'systemsetting',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "settingID" },
        ]
      },
      {
        name: "settingKey",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "settingKey" },
        ]
      },
      {
        name: "fk_systemsetting_createdBy",
        using: "BTREE",
        fields: [
          { name: "createdBy" },
        ]
      },
      {
        name: "fk_systemsetting_updatedBy",
        using: "BTREE",
        fields: [
          { name: "updatedBy" },
        ]
      },
    ]
  });
};
