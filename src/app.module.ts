import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';
import { Admin } from './admin/entities/admin.entity';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // 👈 dùng URL thay vì từng biến
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // 👈 bắt buộc với Neon / Railway
      },
      entities: [Admin],
      autoLoadEntities: true,
    }),
    CustomersModule,
    AuthModule,
  ],
})
export class AppModule {}
