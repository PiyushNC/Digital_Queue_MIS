const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Token = sequelize.define('Token', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tokenNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED'),
      defaultValue: 'WAITING',
    },
    currentCounterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    queuePosition: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Token;
};
