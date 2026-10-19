import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderIssue } from './entities/order-issue.entity';
import { OrderRepository } from './repository/order.repository';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SellerModule } from '../seller/seller.module';

import { Plant } from '../plant/entities/plant.entity';
import { UserPlantModule } from 'src/user-plant/user-plant.module';
import { UserPlant } from 'src/user-plant/entities/user-plant.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Order,
            OrderItem,
            OrderIssue,
            Plant,
            UserPlant,

        ]),
        SellerModule,
        UserPlantModule,
    ],
    controllers: [OrderController],
    providers: [
        OrderRepository,
        OrderService,
    ],  
    exports: [
        OrderRepository,
        OrderService,
    ],
})
export class OrderModule {}