
// customers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SearchCustomerDto, SearchResult, FilterOptions, CustomerStats } from './dto/search-customer.dto';
import { BulkActionDto } from './dto/bulk-action.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  search(@Query() searchDto: SearchCustomerDto) {
    return this.customersService.searchCustomers(searchDto);
  }

  @Get('filter-options')
  getFilterOptions() {
    return this.customersService.getFilterOptions();
  }

  @Post('bulk-send-mail')
  bulkSendMail(@Body() bulkActionDto: BulkActionDto) {
    return this.customersService.bulkSendMail(bulkActionDto.customerIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}