require('dotenv').config();
const path = require('path');
const { sequelize, Admin, Service, Counter, Token, Staff } = require('./server/models');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const admin = await Admin.create({
      email: 'admin@demo.com',
      password: 'admin123',
      name: 'Admin User',
    });
    console.log('Admin created:', admin.email);

    const service1 = await Service.create({
      name: 'Account Opening',
      code: 'A',
      description: 'Open new bank accounts and KYC',
    });

    const service2 = await Service.create({
      name: 'Cash Transactions',
      code: 'B',
      description: 'Cash deposit and withdrawal',
    });

    const service3 = await Service.create({
      name: 'Loans & Mortgages',
      code: 'C',
      description: 'Loan inquiries and applications',
    });

    const service4 = await Service.create({
      name: 'Customer Support',
      code: 'D',
      description: 'Account issues, queries and support',
    });

    console.log('Services created:', [service1.name, service2.name, service3.name]);

    const counter1 = await Counter.create({
      counterNo: 1,
      serviceId: service1.id,
      status: 'AVAILABLE',
    });

    const counter2 = await Counter.create({
      counterNo: 2,
      serviceId: service2.id,
      status: 'AVAILABLE',
    });

    const counter3 = await Counter.create({
      counterNo: 3,
      serviceId: service3.id,
      status: 'AVAILABLE',
    });

    const counter4 = await Counter.create({
      counterNo: 4,
      serviceId: service4.id,
      status: 'AVAILABLE',
    });

    console.log('Counters created:', [counter1.counterNo, counter2.counterNo, counter3.counterNo, counter4.counterNo]);

    const staff1 = await Staff.create({
      email: 'staff1@demo.com',
      password: 'staff123',
      name: 'Staff 1',
    });

    const staff2 = await Staff.create({
      email: 'staff2@demo.com',
      password: 'staff123',
      name: 'Staff 2',
    });

    const staff3 = await Staff.create({
      email: 'staff3@demo.com',
      password: 'staff123',
      name: 'Staff 3',
    });

    const staff4 = await Staff.create({
      email: 'staff4@demo.com',
      password: 'staff123',
      name: 'Staff 4',
    });

    console.log('Staff created:', [staff1.email, staff2.email, staff3.email, staff4.email]);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Staff 1: staff1@demo.com / staff123');
    console.log('Staff 2: staff2@demo.com / staff123');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
