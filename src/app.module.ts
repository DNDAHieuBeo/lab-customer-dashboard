import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      synchronize: true,
      autoLoadEntities: true,
    }),
    CustomersModule,
  ],
})
export class AppModule {}
