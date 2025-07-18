import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: '123',
      database: 'demo',
      synchronize: true,
      autoLoadEntities: true,
    }),
    CustomersModule,
  ],
})
export class AppModule {}
