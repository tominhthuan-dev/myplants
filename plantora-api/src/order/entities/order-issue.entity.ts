
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderIssueStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

@Entity('order_issues')
export class OrderIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  reported_by: number;

  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @Column({
    type: 'enum',
    enum: OrderIssueStatus,
    default: OrderIssueStatus.OPEN,
  })
  status: OrderIssueStatus;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  resolution_note: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}