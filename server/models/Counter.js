const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Counter = sequelize.define('Counter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    counterNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'BUSY', 'OFFLINE'),
      defaultValue: 'OFFLINE',
    },
  });

  return Counter;
};
