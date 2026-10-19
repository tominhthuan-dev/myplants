import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plant_moderations')
export class PlantModeration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  plant_id: number;

  @Column()
  admin_id: number;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  reason: string|null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}