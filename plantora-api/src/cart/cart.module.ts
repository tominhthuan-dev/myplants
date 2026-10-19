import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartRepository } from './repositorys/cart.repository';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PlantModule } from 'src/plant/plant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    PlantModule,
  ],
  controllers: [CartController],
  providers: [CartRepository, CartService],
})
export class CartModule {}