import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_plants')
export class UserPlant {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'bigint' })
  plant_id: number;

  @Column({ type: 'bigint' })
  order_item_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string | null;

  @Column({ type: 'datetime' })
  acquired_at: Date;

  @CreateDateColumn()
  created_at: Date;
}