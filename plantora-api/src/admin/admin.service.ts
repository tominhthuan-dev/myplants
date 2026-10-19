import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserStatus, UserRole } from '../users/entities/user.entity';

import { SellerRepository } from '../seller/seller.repository';
import { SellerStatus } from '../seller/entities/seller-profile.entity';

import { PlantRepository } from '../plant/repositories/plant.repository';
import { PlantStatus } from '../plant/entities/plant.entity';
import { PlantModerationRepository } from '../plant/repositories/plant-moderation.repository';

import { OrderRepository } from '../order/repository/order.repository';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly plantRepository: PlantRepository,
    private readonly plantModerationRepository: PlantModerationRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Admin duyệt Seller
  async approveSeller(adminId: number, sellerId: number) {
    const seller = await this.sellerRepository.findById(sellerId);

    if (!seller) {
      throw new NotFoundException('Seller không tồn tại');
    }

    if (seller.status !== SellerStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ Seller đang PENDING mới được duyệt',
      );
    }

    const previousStatus = seller.status;
    seller.status = SellerStatus.ACTIVE;

    const savedSeller = await this.sellerRepository.save(seller);

    await this.auditService.createLog({
      actor_id: adminId,
      action: 'APPROVE_SELLER',
      target_type: 'SELLER',
      target_id: savedSeller.id,
      details: {
        previous_status: previousStatus,
        new_status: savedSeller.status,
      },
    });

    return savedSeller;
  } 

  // Admin duyệt Plant
  async approvePlant(adminId: number, plantId: number) {
    const plant = await this.plantRepository.findById(plantId);

    if (!plant) {
      throw new NotFoundException('Plant không tồn tại');
    }

    if (plant.status !== PlantStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        'Chỉ Plant đang PENDING_REVIEW mới được duyệt',
      );
    }

    plant.status = PlantStatus.APPROVED;
    plant.reject_reason = null;

    const savedPlant = await this.plantRepository.save(plant);

    await this.auditService.createLog({
      actor_id: adminId,
      action: 'APPROVE_PLANT',
      target_type: 'PLANT',
      target_id: savedPlant.id,
      details: {
        previous_status: PlantStatus.PENDING_REVIEW,
        new_status: PlantStatus.APPROVED,
      },
    });

    return savedPlant;
  }


  // Admin tạm khóa Seller
  async suspendSeller(adminId: number, sellerId: number) {
    const seller = await this.sellerRepository.findById(sellerId);

    if (!seller) {
      throw new NotFoundException('Seller không tồn tại');
    }

    const user = await this.userRepository.findOne({
      where: { id: seller.user_id },
    });

    if (!user || user.role !== UserRole.SELLER) {
      throw new NotFoundException('Tài khoản Seller không tồn tại');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        'Chỉ tài khoản Seller đang ACTIVE mới được tạm khóa',
      );
    }

    const previousStatus = user.status;
    user.status = UserStatus.SUSPENDED;

    const savedUser = await this.userRepository.save(user);

    await this.auditService.createLog({
      actor_id: adminId,
      action: 'SUSPEND_SELLER',
      target_type: 'SELLER',
      target_id: seller.id,
      details: {
        user_id: savedUser.id,
        previous_status: previousStatus,
        new_status: savedUser.status,
      },
    });

    return {
      message: 'Tạm khóa tài khoản Seller thành công',
      seller_id: seller.id,
      user_id: savedUser.id,
      status: savedUser.status,
    };
  }

  // Admin khôi phục Seller
  async restoreSeller(adminId: number, sellerId: number) {
    const seller = await this.sellerRepository.findById(sellerId);

    if (!seller) {
      throw new NotFoundException('Seller không tồn tại');
    }

    const user = await this.userRepository.findOne({
      where: { id: seller.user_id },
    });

    if (!user || user.role !== UserRole.SELLER) {
      throw new NotFoundException('Tài khoản Seller không tồn tại');
    }

    if (user.status !== UserStatus.SUSPENDED) {
      throw new BadRequestException(
        'Chỉ tài khoản Seller đang SUSPENDED mới được khôi phục',
      );
    }

    const previousStatus = user.status;
    user.status = UserStatus.ACTIVE;

    const savedUser = await this.userRepository.save(user);

    await this.auditService.createLog({
      actor_id: adminId,
      action: 'RESTORE_SELLER',
      target_type: 'SELLER',
      target_id: seller.id,
      details: {
        user_id: savedUser.id,
        previous_status: previousStatus,
        new_status: savedUser.status,
      },
    });

    return {
      message: 'Khôi phục tài khoản Seller thành công',
      seller_id: seller.id,
      user_id: savedUser.id,
      status: savedUser.status,
    };
  }

  // Admin từ chối Plant
  async rejectPlant(
    adminId: number,
    plantId: number,
    reason: string,
  ) {
    const plant =await this.plantRepository.findById(plantId);

    if (!plant) {
      throw new NotFoundException(
        'Plant không tồn tại',
      );
    }

    if (plant.status !== PlantStatus.PENDING_REVIEW) {
        throw new BadRequestException(
            'Chỉ Plant đang PENDING_REVIEW mới được từ chối',
        );
    }

    if (!reason || reason.trim() === '') {
        throw new BadRequestException(
            'Reason không được để trống',
        );
    }

    plant.status = PlantStatus.REJECTED;
    plant.reject_reason = reason;

        
    await this.plantRepository.save(plant);

    const moderation = await this.plantModerationRepository.createModeration({
      plant_id: plant.id,
      admin_id: adminId,
      action: 'REJECT',
      reason: reason,
    });

    await this.auditService.createLog({
      actor_id: adminId,
      action: 'REJECT_PLANT',
      target_type: 'PLANT',
      target_id: plant.id,
      details: {
        previous_status: PlantStatus.PENDING_REVIEW,
        new_status: PlantStatus.REJECTED,
        reason: reason,
      },
    });

    return moderation;
  }

  async getDashboard() {
    const pendingSellers =
      await this.sellerRepository.findByStatus(
        SellerStatus.PENDING,
      );

    const pendingPlants =
      await this.plantRepository.findByStatus(
        PlantStatus.PENDING_REVIEW,
      );

    const orders = await this.orderRepository.findPendingOrders();

    return {
      pending_sellers: pendingSellers.length,
      pending_plants: pendingPlants.length,
      orders_need_processing: orders.length,
    };
  }

  async getPlants(
    search?: string,
    speciesId?: number,
    status?: PlantStatus,
    page = 1,
    limit = 10,
  ) {
    return this.plantRepository.findAllPlants(
      search,
      speciesId,
      status,
      page,
      limit,
    );
  }

  async getPlantDetail(plantId: number) {
    const plant = await this.plantRepository.findById(plantId);

    if (!plant) {
      throw new NotFoundException('Plant không tồn tại');
    }

    return plant;
  }
}