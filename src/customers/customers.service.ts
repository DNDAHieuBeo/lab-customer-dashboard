import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /** ➕ Tạo mới customer */
  create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const newCustomer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(newCustomer);
  }

  /** 📥 Lấy toàn bộ */
  findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  /** 🔎 Lấy theo ID */
  findOne(id: string): Promise<Customer | null> {
    return this.customerRepository.findOneBy({ id });
  }

  /** ✏️ Sửa */
  update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    return this.customerRepository.save({ ...updateCustomerDto, id });
  }

  /** ❌ Xoá */
  async remove(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }
}
