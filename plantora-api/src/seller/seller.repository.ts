import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SellerProfile, SellerStatus } from './entities/seller-profile.entity';

@Injectable()
export class SellerRepository {
    constructor(
        @InjectRepository(SellerProfile)
        private readonly repository: Repository<SellerProfile>,
    ) {}

    async findByUserId(userId: number) {
        return this.repository.findOne({
            where: {
                user_id: userId,
            },
        });
    }

    async createSellerProfile(data: Partial<SellerProfile>) {
        const seller = this.repository.create(data);

        return this.repository.save(seller);
    }

    async findById(id: number) {
        return this.repository.findOne({
            where: {
                id,
            },
        });
    }

    async findByStatus(status: SellerStatus) {
        return this.repository.find({
            where: {
                status,
            },
            order: {
                id: 'DESC',
            },
        });
    }

    async save(seller: SellerProfile) {
        return this.repository.save(seller);
    }
}