import { Controller, Param, ParseIntPipe, Patch, UseGuards, Body, Req, Get, Query} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { AdminService } from './admin.service';
import { PlantStatus } from 'src/plant/entities/plant.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
    ) {}
    @Patch('sellers/:id/approve')
    @Roles('ADMIN')
    approveSeller(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.approveSeller(Number(req.user.userId), id);
    }

    @Patch('plants/:id/approve')
    @Roles('ADMIN')
    async approvePlant(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {
        const adminId = Number(req.user.userId);
        return this.adminService.approvePlant(adminId, id);
    }

    @Patch('sellers/:id/suspend')
    @Roles('ADMIN')
    suspendSeller(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.suspendSeller(Number(req.user.userId), id);
    }

    @Patch('sellers/:id/restore')
    @Roles('ADMIN')
    restoreSeller(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.adminService.restoreSeller(Number(req.user.userId), id);
    }

    @Patch('plants/:id/reject')
    @Roles('ADMIN')
    rejectPlant(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body()
        body: {
            reason: string;
        },
    ) {
        return this.adminService.rejectPlant(
            Number(req.user.userId),
            id,
            body.reason
        );
    }

    @Get('dashboard')
    @Roles('ADMIN')
    getDashboard() {
        return this.adminService.getDashboard();
    }

    @Get('plants')
    @Roles('ADMIN')
    getPlants(
        @Query('search') search?: string,
        @Query('species_id') speciesId?: string,
        @Query('status') status?: PlantStatus,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getPlants(
            search,
            speciesId ? Number(speciesId) : undefined,
            status,
            page ? Number(page) : 1,
            limit ? Number(limit) : 10,
        );
    }

    @Get('plants/:id')
    @Roles('ADMIN')
    getPlantDetail(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.adminService.getPlantDetail(id);
    }
}