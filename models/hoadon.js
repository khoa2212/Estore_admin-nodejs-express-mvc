const Sequelize = require('sequelize');
const {UUIDV4} = require("sequelize");
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hoadon', {
    HOADON_ID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    GIOHANG_ID: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'giohang',
        key: 'GIOHANG_ID'
      }
    },
    NGAY_MUA: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    TONG_TIEN: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    SDT: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    DIA_CHI: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'hoadon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "HOADON_ID" },
        ]
      },
      {
        name: "FK_HOADON_GIOHANG",
        using: "BTREE",
        fields: [
          { name: "GIOHANG_ID" },
        ]
      },
    ]
  });
};
