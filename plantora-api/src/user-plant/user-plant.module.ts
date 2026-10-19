import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPlant } from './entities/user-plant.entity';
import { UserPlantRepository } from './repositories/user-plant.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserPlant]),
    ],
    providers: [
        UserPlantRepository,
    ],
    exports: [
        UserPlantRepository,
    ],
})
export class UserPlantModule {}