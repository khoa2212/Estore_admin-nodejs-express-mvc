const Sequelize = require('sequelize');
const {UUIDV4} = require("sequelize");
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quanao', {
    QUANAO_ID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    LOAI_ID: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'loai',
        key: 'LOAI_ID'
      }
    },
    MAU: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    THUONGHIEU_ID: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'thuonghieu',
        key: 'THUONGHIEU_ID'
      }
    },
    GIA: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    SO_LUONG: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    GIOI_TINH: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    DA_XOA: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    LINK: {
      type: DataTypes.STRING(2083),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'quanao',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "QUANAO_ID" },
        ]
      },
      {
        name: "FK_QUANAO_LOAI",
        using: "BTREE",
        fields: [
          { name: "LOAI_ID" },
        ]
      },
      {
        name: "FK_QUANAO_THUONGHIEU",
        using: "BTREE",
        fields: [
          { name: "THUONGHIEU_ID" },
        ]
      },
    ]
  });
};
