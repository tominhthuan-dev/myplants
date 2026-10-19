import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';

import { AddCartItemDto, UpdateCartItemDto } from '../cart/dto/add-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(
      Number(req.user.userId),
    );
  }

  @Post('items')
  addItem(
    @Req() req,
    @Body() body: AddCartItemDto,
  ) {
    return this.cartService.addItem(
      Number(req.user.userId),
      body.plant_id,
      body.quantity,
    );
  }

  @Patch('items/:id')
  updateItem(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      Number(req.user.userId),
      id,
      body.quantity,
    );
  }

  @Delete('items/:id')
  removeItem(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeItem(
      Number(req.user.userId),
      id,
    );
  }
}