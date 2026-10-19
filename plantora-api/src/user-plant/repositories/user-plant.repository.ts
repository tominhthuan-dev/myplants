import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserPlant } from '../entities/user-plant.entity';

@Injectable()
export class UserPlantRepository {
    constructor(
        @InjectRepository(UserPlant)
        private readonly repository: Repository<UserPlant>,
    ) {}

    async findByUserId(userId: number) {
        return this.repository.find({
            where: {
                user_id: userId,
            },
            order: {
                acquired_at: 'DESC',
            },
        });
    }

    async create(data: Partial<UserPlant>): Promise<UserPlant> {
        const userPlant = this.repository.create(data);

        return this.repository.save(userPlant);
    }
}