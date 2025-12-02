const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dishmenu', {
    menuID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'menu',
        key: 'menuID'
      }
    },
    dishID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'dish',
        key: 'dishID'
      }
    }
  }, {
    sequelize,
    tableName: 'dishmenu',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "menuID" },
          { name: "dishID" },
        ]
      },
      {
        name: "idx_dishMenu_menu",
        using: "BTREE",
        fields: [
          { name: "menuID" },
        ]
      },
      {
        name: "idx_dishMenu_dish",
        using: "BTREE",
        fields: [
          { name: "dishID" },
        ]
      },
    ]
  });
};
