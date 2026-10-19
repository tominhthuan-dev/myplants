import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  actor_id: number | null;
  action: string;
  target_type: string;
  target_id: number;
  details?: Record<string, any> | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(data: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      actor_id: data.actor_id,
      action: data.action,
      target_type: data.target_type,
      target_id: data.target_id,
      details: data.details ?? null,
    });

    return this.auditLogRepository.save(log);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findByTarget(
    target_type: string,
    target_id: number,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { target_type, target_id },
      order: { created_at: 'DESC' },
    });
  }

  

}

