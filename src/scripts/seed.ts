import { connectDB, disconnectDB } from '../lib/mongodb.js';
import { User } from '../models/User.js';
import { FinancialRecord } from '../models/FinancialRecord.js';

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await FinancialRecord.deleteMany({});
    await User.deleteMany({});

    console.log('👤 Creating users...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@finance.com',
      passwordHash: 'admin123',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const analystUser = await User.create({
      name: 'Analyst User',
      email: 'analyst@finance.com',
      passwordHash: 'analyst123',
      role: 'ANALYST',
      status: 'ACTIVE',
    });

    const viewerUser = await User.create({
      name: 'Viewer User',
      email: 'viewer@finance.com',
      passwordHash: 'viewer123',
      role: 'VIEWER',
      status: 'ACTIVE',
    });

    const inactiveUser = await User.create({
      name: 'Inactive User',
      email: 'inactive@finance.com',
      passwordHash: 'inactive123',
      role: 'VIEWER',
      status: 'INACTIVE',
    });

    console.log('✅ Created users:');
    console.log(`   - ${adminUser.name} (${adminUser.email}) - ADMIN`);
    console.log(`   - ${analystUser.name} (${analystUser.email}) - ANALYST`);
    console.log(`   - ${viewerUser.name} (${viewerUser.email}) - VIEWER`);
    console.log(`   - ${inactiveUser.name} (${inactiveUser.email}) - INACTIVE`);

    console.log('💰 Creating financial records...');
    const recordsData = [
      {
        amount: 5000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2024-01-15'),
        notes: 'Monthly salary',
        createdBy: adminUser._id,
      },
      {
        amount: 2000,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date('2024-01-20'),
        notes: 'Freelance project payment',
        createdBy: adminUser._id,
      },
      {
        amount: 500,
        type: 'INCOME',
        category: 'Bonus',
        date: new Date('2024-02-01'),
        notes: 'Performance bonus',
        createdBy: adminUser._id,
      },
      {
        amount: 5000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2024-02-15'),
        notes: 'Monthly salary',
        createdBy: adminUser._id,
      },
      {
        amount: 1500,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date('2024-02-18'),
        notes: 'Contract work',
        createdBy: adminUser._id,
      },
      {
        amount: 5000,
        type: 'INCOME',
        category: 'Salary',
        date: new Date('2024-03-15'),
        notes: 'Monthly salary',
        createdBy: adminUser._id,
      },
      {
        amount: 1200,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2024-01-01'),
        notes: 'Monthly rent',
        createdBy: adminUser._id,
      },
      {
        amount: 300,
        type: 'EXPENSE',
        category: 'Utilities',
        date: new Date('2024-01-05'),
        notes: 'Electricity and water bills',
        createdBy: adminUser._id,
      },
      {
        amount: 150,
        type: 'EXPENSE',
        category: 'Groceries',
        date: new Date('2024-01-10'),
        notes: 'Weekly grocery shopping',
        createdBy: adminUser._id,
      },
      {
        amount: 80,
        type: 'EXPENSE',
        category: 'Transportation',
        date: new Date('2024-01-12'),
        notes: 'Gas',
        createdBy: adminUser._id,
      },
      {
        amount: 50,
        type: 'EXPENSE',
        category: 'Entertainment',
        date: new Date('2024-01-18'),
        notes: 'Movie tickets',
        createdBy: adminUser._id,
      },
      {
        amount: 1200,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2024-02-01'),
        notes: 'Monthly rent',
        createdBy: adminUser._id,
      },
      {
        amount: 200,
        type: 'EXPENSE',
        category: 'Groceries',
        date: new Date('2024-02-05'),
        notes: 'Weekly groceries',
        createdBy: adminUser._id,
      },
      {
        amount: 100,
        type: 'EXPENSE',
        category: 'Transportation',
        date: new Date('2024-02-10'),
        notes: 'Car maintenance',
        createdBy: adminUser._id,
      },
      {
        amount: 300,
        type: 'EXPENSE',
        category: 'Utilities',
        date: new Date('2024-02-08'),
        notes: 'Utilities',
        createdBy: adminUser._id,
      },
      {
        amount: 200,
        type: 'EXPENSE',
        category: 'Healthcare',
        date: new Date('2024-02-14'),
        notes: 'Doctor visit',
        createdBy: adminUser._id,
      },
      {
        amount: 1200,
        type: 'EXPENSE',
        category: 'Rent',
        date: new Date('2024-03-01'),
        notes: 'Monthly rent',
        createdBy: adminUser._id,
      },
      {
        amount: 80,
        type: 'EXPENSE',
        category: 'Transportation',
        date: new Date('2024-03-05'),
        notes: 'Gas',
        createdBy: adminUser._id,
      },
      {
        amount: 120,
        type: 'EXPENSE',
        category: 'Groceries',
        date: new Date('2024-03-08'),
        notes: 'Groceries',
        createdBy: adminUser._id,
      },
    ];

    const records = await FinancialRecord.insertMany(recordsData);

    console.log(`✅ Created ${records.length} financial records`);

    console.log('\n📊 Database seeding summary:');
    console.log(`   - 4 users created (1 admin, 1 analyst, 1 viewer, 1 inactive)`);
    console.log(`   - ${records.length} financial records created`);

    console.log('\n📧 Test credentials:');
    console.log('   Admin: admin@finance.com / admin123');
    console.log('   Analyst: analyst@finance.com / analyst123');
    console.log('   Viewer: viewer@finance.com / viewer123');
    console.log('   Inactive: inactive@finance.com / inactive123');

    console.log('\n✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seed();
