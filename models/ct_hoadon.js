const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ct_hoadon', {
    HOADON_ID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'hoadon',
        key: 'HOADON_ID'
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
    SO_LUONG_MUA: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_hoadon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "HOADON_ID" },
          { name: "QUANAO_ID" },
        ]
      },
      {
        name: "FK_CT_HOADON_QUANAO",
        using: "BTREE",
        fields: [
          { name: "QUANAO_ID" },
        ]
      },
    ]
  });
};
