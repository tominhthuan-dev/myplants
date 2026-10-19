import {ConflictException,Injectable,NotFoundException, BadRequestException} from '@nestjs/common';

import { UserRepository } from '../users/repositories/user.repository';
import { SellerRepository } from './seller.repository';
import { SellerStatus } from './entities/seller-profile.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class SellerService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly sellerRepository: SellerRepository,
    ) {}

    async registerSeller(
        userId: number,
        shopName: string,
        description?: string,
    ) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }

        const existingSeller = await this.sellerRepository.findByUserId(userId);

        if (existingSeller) {
            throw new ConflictException('User đã đăng ký Seller');
        }

        user.role = UserRole.SELLER;

        await this.userRepository.save(user);

        const seller = await this.sellerRepository.createSellerProfile({
            user_id: userId,
            shop_name: shopName,
            description: description,
            status: SellerStatus.PENDING,
        });

        return seller;
    }

    

    async getSellerProfile(userId: number) {
        const seller =  await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException('Seller không tồn tại');
        }

        return seller;
    }
    //seller update profile
    async updateSellerProfile(userId: number, shopName: string, description?: string) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException('Seller không tồn tại');
        }

        if (shopName !== undefined) {
            seller.shop_name = shopName;
        }

        if (description !== undefined) {
            seller.description = description;
        }

        return this.sellerRepository.save(seller);
    }
}