import {
    Controller,
    Get,
    Req,
    UseGuards,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Body,
    Query,
} from '@nestjs/common';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrderStatus } from './entities/order.entity';

import { CheckoutDto } from './dto/checkout.dto';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderIssueStatus } from './entities/order-issue.entity';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin')
    async getAllOrders(
        @Query('status') status?: OrderStatus,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.orderService.findAllOrders({
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-orders')
    async getMyOrders(@Req() req) {
        return this.orderService.getCustomerOrders(
            Number(req.user.userId),
        );
    }
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/issues')
    async getAllIssues(
        @Query('status') status?: OrderIssueStatus,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.orderService.findAllIssues({
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/:id')
    async getAdminOrderDetail(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.orderService.getAdminOrderDetail(id);
    }

    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/:id/cancel')
    async cancelOrderByAdmin(
        @Param('id', ParseIntPipe) id: number,
        @Body('reason') reason: string,
    ) {
        return this.orderService.cancelOrderByAdmin(id, reason);
    }

    @Get('seller-orders')
    @UseGuards(JwtAuthGuard)
    async getSellerOrders(@Req() req) {
        return this.orderService.getMyOrders(
            Number(req.user.userId),
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/confirm')
    async confirmOrder(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.orderService.confirmOrder(
            Number(req.user.userId),
            id
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/processing')
    async processOrder(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.orderService.processOrder(
            Number(req.user.userId),
            id
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/shipped')
    async shipOrder(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.orderService.shipOrder(
            Number(req.user.userId),
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/delivered')
    async deliverOrder(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.orderService.deliverOrder(
            Number(req.user.userId),
            id
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('checkout')
    async checkout(
        @Req() req,
        @Body() checkoutDto: CheckoutDto,
    ) {
        return this.orderService.checkout(
            Number(req.user.userId),
            checkoutDto
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-orders/:id')
    async getMyOrderDetail(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.orderService.getCustomerOrderDetail(
            Number(req.user.userId),
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-plants')
    async getMyOwnedPlants(@Req() req) {
        return this.orderService.getOwnedPlants(Number(req.user.userId));
    }

    
    @UseGuards(JwtAuthGuard)
    @Post(':id/issues')
    async reportOrderIssue(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body('description') description: string,
    ) {
        return this.orderService.reportOrderIssue(
            id,
            Number(req.user.userId),
            description,
        );
    }

    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/issues/:issueId/resolve')
    async resolveOrderIssue(
        @Param('issueId', ParseIntPipe) issueId: number,
        @Body('resolution_note') resolutionNote: string,
    ) {
        return this.orderService.resolveOrderIssue(
            issueId,
            resolutionNote,
        );
    }

    
}