import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PlantStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    SOLD = 'SOLD',
}

@Entity('plants')
export class Plant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    seller_id: number;

    @Column()
    species_id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    price?: number;

    @Column()
    quantity: number;

    @Column({
        type: 'enum',
        enum: PlantStatus,
        default: PlantStatus.DRAFT,
    })
    status: PlantStatus;

    @Column({ type: 'text', nullable: true })
    reject_reason: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}