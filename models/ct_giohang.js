const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ct_giohang', {
    GIOHANG_ID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'giohang',
        key: 'GIOHANG_ID'
      }
    },
    QUANAO_ID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'quanao',
        key: 'QUANAO_ID'
      }
    },
    SO_LUONG: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_giohang',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "GIOHANG_ID" },
          { name: "QUANAO_ID" },
        ]
      },
      {
        name: "FK_CT_GIOHANG_QUANAO",
        using: "BTREE",
        fields: [
          { name: "QUANAO_ID" },
        ]
      },
    ]
  });
};
