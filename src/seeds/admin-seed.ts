// src/seeds/admin-seed.ts
import { DataSource } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import 'dotenv/config'; // 👈 load biến môi trường từ .env

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Admin],
  ssl: { rejectUnauthorized: false },
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Admin);
  const exists = await repo.findOneBy({ email: 'admin@gmail.com' });

  if (!exists) {
    await repo.insert({
      email: 'admin@gmail.com',
      password: 'admin1234',
      firstName: 'John',
      lastName: 'Wick',
    });
    console.log('✅ Admin seeded');
  } else {
    console.log('⚠️ Admin already exists');
  }

  process.exit();
}

seed();
