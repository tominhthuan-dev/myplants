import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll() {
    return this.auditService.findAll();
  }

  @Get('target')
  async findByTarget(
    @Query('target_type') targetType: string,
    @Query('target_id') targetId: string,
  ) {
    return this.auditService.findByTarget(targetType, Number(targetId));
  }
}
