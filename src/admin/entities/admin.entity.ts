// src/admin/entities/admin.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';
@Entity()
export class Admin {
  @PrimaryColumn()
  email: string;
  @Column()
  password: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
}
