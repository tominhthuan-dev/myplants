import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { SellerModule } from '../seller/seller.module';
import { PlantModule } from '../plant/plant.module';
import { OrderModule } from '../order/order.module';
import { AuditModule } from '../audit/audit.module';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [ 
        TypeOrmModule.forFeature([User]),
        SellerModule, 
        PlantModule, 
        OrderModule, 
        AuditModule 
    ],
    controllers: [ AdminController],
    providers: [AdminService]
})
export class AdminModule {}