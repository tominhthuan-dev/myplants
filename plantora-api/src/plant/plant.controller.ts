import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards, Query } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { PlantService } from './plant.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('plants')
export class PlantController {
    constructor(
        private readonly plantService: PlantService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    createPlant(
        @Req() req,
        @Body()
        body: {
            species_id: number;
            name: string;
            description?: string;
            price?: number;
            quantity: number;
        },
    ) {
        return this.plantService.createPlant(
            req.user.userId,
            body,
        );
    }

    @Get('my-plants')
    @UseGuards(JwtAuthGuard)
    getMyPlants(@Req() req) {
        return this.plantService.getMyPlants(req.user.userId);
    }

    @Get(':id')
    getPublicPlantById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.plantService.getPublicPlantById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    updatePlant(
        @Param('id', ParseIntPipe) id: number,
        @Req() req,
        @Body()
        body: {
            species_id?: number;
            name?: string;
            description?: string;
            price?: number;
            quantity?: number;
        },
    ) {
        return this.plantService.updatePlant(
            req.user.userId,
            id,
            body
        );
    }

    @Post(':id/submit')
    @UseGuards(JwtAuthGuard)
    submitPlant(
        @Param('id', ParseIntPipe) id: number,
        @Req() req,
    ) {
        return this.plantService.submitPlant(
            req.user.userId,
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/publish')
    publishPlant(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.plantService.publishPlant(
            Number(req.user.userId),
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-plants/:id')
    GetPlantById(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ){
        return this.plantService.getPlantById(
            Number(req.user.userId),
            id
        );
    }

    @Get()
    getAvailablePlants(
        @Query('search') search?: string,
        @Query('species_id') speciesId?: number,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.plantService.getAvailablePlants(
            search, 
            speciesId ? Number(speciesId) : undefined,
            page ? Number(page) : 1,
            limit ? Number(limit) : 10
        );
    }
}