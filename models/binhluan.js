const Sequelize = require('sequelize');
const {UUIDV4} = require("sequelize");
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('binhluan', {
    BINHLUAN_ID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    QUANAO_ID: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'quanao',
        key: 'QUANAO_ID'
      }
    },
    USERNAME: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    DIEM: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NOI_DUNG: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'binhluan',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "BINHLUAN_ID" },
        ]
      },
      {
        name: "FK_BINHLUAN_QUANAO",
        using: "BTREE",
        fields: [
          { name: "QUANAO_ID" },
        ]
      },
    ]
  });
};
