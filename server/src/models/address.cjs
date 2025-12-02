const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('address', {
    addressID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    number: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ward: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fullAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'address',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "addressID" },
        ]
      },
      {
        name: "idx_address_fulltext",
        type: "FULLTEXT",
        fields: [
          { name: "fullAddress" },
        ]
      },
    ]
  });
};
