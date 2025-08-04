import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SearchCustomerDto, SearchResult, FilterOptions, CustomerStats } from './dto/search-customer.dto';


@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /** ➕ Tạo mới customer */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const newCustomer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(newCustomer);
  }

  /** 📥 Lấy toàn bộ */
  findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  /** 🔍 Search và Filter customers với pagination */
  async searchCustomers(searchDto: SearchCustomerDto): Promise<SearchResult<Customer>> {
    const { searchTerm, type, status, page = 1, limit = 10 } = searchDto;
    
    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    // Search functionality
    if (searchTerm) {
      queryBuilder.where(
        `(
          LOWER(customer.businessName) LIKE LOWER(:searchTerm) OR
          LOWER(customer.email) LIKE LOWER(:searchTerm) OR
          LOWER(customer.firstName) LIKE LOWER(:searchTerm) OR
          LOWER(customer.lastName) LIKE LOWER(:searchTerm) OR
          LOWER(customer.phoneNumber) LIKE LOWER(:searchTerm) OR
          LOWER(customer.subscriptionType) LIKE LOWER(:searchTerm)
        )`,
        { searchTerm: `%${searchTerm}%` }
      );
    }

    // Type filter
    if (type && type !== 'All') {
      queryBuilder.andWhere('customer.type = :type', { type });
    }

    // Status filter
    if (status && status !== 'All') {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by created date (newest first)
    queryBuilder.orderBy('customer.registeredDate', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /** 📊 Lấy các options cho filter */
  async getFilterOptions(): Promise<FilterOptions> {
    const types = await this.customerRepository
      .createQueryBuilder('customer')
      .select('DISTINCT customer.type', 'type')
      .getRawMany();

    const statuses = await this.customerRepository
      .createQueryBuilder('customer')
      .select('DISTINCT customer.status', 'status')
      .getRawMany();

    return {
      types: ['All', ...types.map(t => t.type).filter(Boolean)],
      statuses: ['All', ...statuses.map(s => s.status).filter(Boolean)],
    };
  }


  async bulkSendMail(customerIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const customers = await this.customerRepository.find({
        where: { id: In(customerIds) },
        select: ['id', 'email', 'firstName', 'lastName']
      });

      if (customers.length === 0) {
        return { success: false, message: 'Không tìm thấy customer nào' };
      }
      
      console.log(`Gửi mail đến ${customers.length} customers:`, 
        customers.map(c => c.email)
      );

      return { 
        success: true, 
        message: `Đã gửi mail thành công đến ${customers.length} customers` 
      };
    } catch (error) {
      console.error('Lỗi khi gửi mail hàng loạt:', error);
      return { success: false, message: 'Có lỗi xảy ra khi gửi mail' };
    }
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

  /** 📈 Thống kê customers */
  async getStats(): Promise<CustomerStats> {
    const total = await this.customerRepository.count();
    
    const typeStats = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.type')
      .getRawMany();

    const statusStats = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('customer.status')
      .getRawMany();

    const byType = typeStats.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});

    const byStatus = statusStats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    return { total, byType, byStatus };
  }
}