import * as bcrypt from 'bcrypt';

async function run() {
  const hashed = await bcrypt.hash('admin1234', 10);
  console.log('Mật khẩu mã hóa:', hashed);
}
run();
