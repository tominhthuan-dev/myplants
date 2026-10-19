import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    actor_id: number | null;

    @Column({ type: 'varchar', length: 100 })
    action: string;

    @Column({ type: 'varchar', length: 50 })
    target_type: string;

    @Column({ type: 'int' })
    target_id: number;

    @Column({ type: 'json', nullable: true })
    details: Record<string, any> | null;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;
}

