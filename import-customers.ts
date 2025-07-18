import axios from 'axios';
import * as fs from 'fs';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: string;
  businessName: string;
  subscriptionType: string;
  registeredDate: string;
  lastActiveDate: string;
  status: string;
}

const data = JSON.parse(fs.readFileSync('./db.json', 'utf-8')) as {
  customers: Customer[];
};
const customers = data.customers;

async function importCustomers() {
  for (const customer of customers) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await axios.post('http://localhost:3002/customers', customer);
      console.log(`✅ Imported: ${customer.id}`);
    } catch (error: any) {
      console.error(`❌ Failed: ${customer.id}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.data) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error(error.response.data); // 👈 dòng này in chi tiết từ NestJS
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error(error.message);
      }
    }
  }
}

importCustomers();
