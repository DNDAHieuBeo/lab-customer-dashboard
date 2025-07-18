import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  businessName: string;

  @Column()
  subscriptionType: string;

  @Column()
  registeredDate: string;

  @Column()
  lastActiveDate: string;

  @Column()
  status: string;
}
