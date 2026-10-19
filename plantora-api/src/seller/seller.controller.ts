import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { SellerService } from './seller.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sellers')
export class SellerController {
    constructor(
        private readonly sellerService: SellerService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    registerSeller(
        @Req() req,
        @Body()
        body: {
            shop_name: string;
            description?: string;
        },
    ) {
        return this.sellerService.registerSeller(
            req.user.userId,
            body.shop_name,
            body.description,
        );
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getSellerProfile(@Req() req) {
        return this.sellerService.getSellerProfile(Number(req.user.userId));
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    updateSellerProfile(
        @Req() req,
        @Body()
        body: {
            shop_name: string;
            description?: string;
        },
    ) {
        return this.sellerService.updateSellerProfile(
            Number(req.user.userId),
            body.shop_name,
            body.description,
        );
    }
}