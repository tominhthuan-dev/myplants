import {BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { SellerRepository } from '../seller/seller.repository';
import { SellerStatus } from '../seller/entities/seller-profile.entity';

import { PlantRepository } from './repositories/plant.repository';
import { PlantStatus } from './entities/plant.entity';

@Injectable()
export class PlantService {
    constructor(
        private readonly plantRepository: PlantRepository,
        private readonly sellerRepository: SellerRepository,
    ) {}

    async createPlant(
        userId: number,
        data: {
            species_id: number;
            name: string;
            description?: string;
            price?: number;
            quantity: number;
        },
    ) {
        // 1. Tìm SellerProfile của user
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {throw new NotFoundException('User chưa có Seller Profile',)}

        // 2. Kiểm tra Seller đã được Admin duyệt chưa
        if (seller.status !== SellerStatus.ACTIVE) {throw new ForbiddenException('Seller chưa được Admin kích hoạt')}

        // 3. Tạo Plant
        const plant = await this.plantRepository.createPlant({
            seller_id: seller.id,
            species_id: data.species_id,
            name: data.name,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
            status: PlantStatus.DRAFT,
        });

        return plant;
    }

    async getMyPlants(userId: number) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if(!seller) {throw new NotFoundException('User chưa có Seller Profile')}

        return this.plantRepository.findBySellerId(seller.id);
    }

    async updatePlant(
        userId: number,
        plantId: number,
        data: {
            species_id?: number;
            name?: string;
            description?: string;
            price?: number;
            quantity?: number;
        },
    ) {
        // 1. Tìm Seller Profile
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException('User chưa có Seller Profile');
        }

        // 2. Tìm Plant
        const plant = await this.plantRepository.findById(plantId);

        if (!plant) {
            throw new NotFoundException('Plant không tồn tại');
        }

        // 3. Kiểm tra ownership
        if (plant.seller_id !== seller.id) {throw new ForbiddenException( 'Bạn không có quyền sửa Plant này')}

        // 4. Kiểm tra status
        if (
            plant.status !== PlantStatus.DRAFT &&
            plant.status !== PlantStatus.REJECTED
        ) {
            throw new ForbiddenException(
                'Chỉ Plant ở trạng thái DRAFT hoặc REJECTED mới được sửa',
            );
        }

        // 5. Cập nhật dữ liệu
        if (data.species_id !== undefined) {
            plant.species_id = data.species_id;
        } 

        if (data.name !== undefined) {
            plant.name = data.name;
        }

        if (data.description !== undefined) {
            plant.description = data.description;
        }

        if (data.price !== undefined) {
            plant.price = data.price;
        }

        if (data.quantity !== undefined) {
            plant.quantity = data.quantity;
        }

        // 6. Lưu
        return this.plantRepository.save(plant);
    }

    async submitPlant(userId: number, plantId: number) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) { throw new NotFoundException('User chưa có Seller Profile')}

        const plant = await this.plantRepository.findById(plantId);

        if (!plant) { throw new NotFoundException('Plant không tồn tại')}

        // Chỉ Seller sở hữu plant mới được submit
        if (plant.seller_id !== seller.id) {throw new ForbiddenException('Bạn không có quyền submit Plant này',)}

        // Chỉ DRAFT mới được submit
        if (plant.status !== PlantStatus.DRAFT) {throw new ForbiddenException('Chỉ Plant ở trạng thái DRAFT mới được submit')}

        // Kiểm tra dữ liệu tối thiểu
        if (!plant.name || !plant.species_id || !plant.quantity) {throw new BadRequestException('Plant chưa đủ thông tin để submit')}

        plant.status = PlantStatus.PENDING_REVIEW;

        return this.plantRepository.save(plant);
    }

    async publishPlant(userId: number, plantId: number) {
        // 1. Tìm seller profile của user đang đăng nhập
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException('User chưa có Seller Profile');
        }

        // 2. Tìm Plant
        const plant = await this.plantRepository.findById(plantId);

        if (!plant) {
            throw new NotFoundException('Plant không tồn tại');
        }

        // 3. Kiểm tra ownership
        if (plant.seller_id !== seller.id) {
            throw new ForbiddenException('Bạn không có quyền publish Plant này');
        }

        // 4. Chỉ Plant APPROVED mới được publish
        if (plant.status !== PlantStatus.APPROVED) {
            throw new BadRequestException('Chỉ Plant đã được APPROVED mới được publish');
        }

        // 5. Publish bắt buộc phải có giá
        if (plant.price === null || plant.price === undefined || plant.price <= 0) {
            throw new BadRequestException('Plant phải có giá hợp lệ trước khi publish');
        }

        // 6. APPROVED → AVAILABLE
        plant.status = PlantStatus.AVAILABLE;

        return this.plantRepository.save(plant);
    }

    async getPlantById(userId: number, plantId: number) {
        // 1. Tìm seller profile của user đang đăng nhập
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException('User chưa có Seller Profile');
        }

        // 2. Tìm Plant
        const plant = await this.plantRepository.findById(plantId);

        if(!plant){
            throw new NotFoundException('Plant không tồn tại');
        }

        // 3. Kiểm tra ownership
        if (plant.seller_id !== seller.id) {
            throw new ForbiddenException('Bạn không có quyền xem Plant này');
        }

        // 4. Trả về Plant
        return plant;
    }

    async getAvailablePlants(
        search?: string,
        speciesId?: number,
        page = 1,
        limit = 10,
    ) {
        if (page < 1) {
            page = 1;
        }

        if (limit < 1) {
            limit = 10;
        }

        if (limit > 50) {
            limit = 50;
        }

        const { data, total } =
            await this.plantRepository.findAvailablePlants(
                search,
                speciesId,
                page,
                limit,
            );

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    async getPublicPlantById(plantId: number) {
        const plant = await this.plantRepository.findAvailableById(plantId);

        if (!plant) {
            throw new NotFoundException('Plant không tồn tại hoặc chưa được bán');
        }

        return plant;
    }
}
