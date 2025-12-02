const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hallimage', {
    imageID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hallID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hall',
        key: 'hallID'
      }
    },
    imageURL: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'hallimage',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "imageID" },
        ]
      },
      {
        name: "hallID",
        using: "BTREE",
        fields: [
          { name: "hallID" },
        ]
      },
    ]
  });
};
