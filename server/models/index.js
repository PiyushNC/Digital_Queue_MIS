const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../db.sqlite'),
  logging: false,
});

const Admin = require('./Admin')(sequelize);
const Service = require('./Service')(sequelize);
const Counter = require('./Counter')(sequelize);
const Token = require('./Token')(sequelize);
const Staff = require('./Staff')(sequelize);

Service.hasMany(Token, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
Token.belongsTo(Service, { foreignKey: 'serviceId' });

Service.hasMany(Counter, { foreignKey: 'serviceId', onDelete: 'CASCADE' });
Counter.belongsTo(Service, { foreignKey: 'serviceId' });

Counter.hasMany(Staff, { foreignKey: 'counterId', onDelete: 'SET NULL' });
Staff.belongsTo(Counter, { foreignKey: 'counterId' });

Service.hasMany(Staff, { foreignKey: 'serviceId', onDelete: 'SET NULL' });
Staff.belongsTo(Service, { foreignKey: 'serviceId' });

Counter.hasOne(Token, { foreignKey: 'currentCounterId', onDelete: 'SET NULL' });
Token.belongsTo(Counter, { as: 'currentCounter', foreignKey: 'currentCounterId' });

module.exports = {
  sequelize,
  Admin,
  Service,
  Counter,
  Token,
  Staff,
};
