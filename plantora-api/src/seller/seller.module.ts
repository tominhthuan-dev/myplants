import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { SellerRepository } from './seller.repository';
import { SellerProfile } from './entities/seller-profile.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerProfile]),
    UsersModule,
  ],
  controllers: [SellerController],
  providers: [SellerService, SellerRepository], 

  exports: [SellerService, SellerRepository],
})
export class SellerModule {}
