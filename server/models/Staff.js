const { DataTypes } = require('sequelize');
const bcryptjs = require('bcryptjs');

module.exports = (sequelize) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    counterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Staff.beforeCreate(async (staff) => {
    staff.password = await bcryptjs.hash(staff.password, 10);
  });

  return Staff;
};
