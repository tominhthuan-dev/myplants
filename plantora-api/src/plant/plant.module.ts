import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Plant } from './entities/plant.entity';
import { PlantRepository } from './repositories/plant.repository';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';


import { SellerModule } from '../seller/seller.module';

import { PlantModeration } from './entities/plant-moderation.entity';
import { PlantModerationRepository } from './repositories/plant-moderation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plant, PlantModeration]),
    SellerModule,
  ],
  controllers: [PlantController],
  providers: [PlantRepository, PlantService, PlantModerationRepository],
  exports: [PlantRepository, PlantService, PlantModerationRepository],
})
export class PlantModule {}