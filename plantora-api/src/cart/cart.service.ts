import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CartRepository } from './repositorys/cart.repository';
import { PlantRepository } from '../plant/repositories/plant.repository';
import { PlantStatus } from '../plant/entities/plant.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly plantRepository: PlantRepository,
  ) {}

    private async getOrCreateCart(userId: number) {
        let cart = await this.cartRepository.findByUserId(userId);

        if (!cart) {
            cart = await this.cartRepository.createCart(userId);
        }

        return cart;
    }

    

    // Lấy giỏ hàng của user, nếu chưa có thì tạo mới
    async getCart(userId: number) {
        const cart = await this.getOrCreateCart(userId);

        const items = await this.cartRepository.findItems(cart.id);

        return {
            id: cart.id,
            user_id: cart.user_id,
            items,
        };
    }

    // Thêm sản phẩm vào giỏ hàng
    async addItem(
        userId: number,
        plantId: number,
        quantity: number,
    ) {

        const plant = await this.plantRepository.findById(plantId);

        if (!plant) {
            throw new NotFoundException('Plant không tồn tại');
        }

        if (plant.status !== PlantStatus.AVAILABLE) {
            throw new BadRequestException(
                'Plant chưa được bán',
            );
        }

        if (quantity !== 1) {
            throw new BadRequestException(
                'Mỗi cây thực tế chỉ được mua 1 lần',
            );
        }

        const cart = await this.getOrCreateCart(userId);

        const existingItem = await this.cartRepository.findItem(
            cart.id,
            plantId,
        );

        if (existingItem) {
            throw new BadRequestException(
                'Sản phẩm đã có trong giỏ hàng',
            );
        }

        return this.cartRepository.createItem(
            cart.id,
            plantId,
            quantity,
        );
    }

    async updateItem(
        userId: number,
        itemId: number,
        quantity: number,
    ) {
        if (quantity !== 1) {
            throw new BadRequestException(
                'Mỗi cây thực tế chỉ được mua 1 lần',
            );
        }

        const cart = await this.getOrCreateCart(userId);

        const items = await this.cartRepository.findItems(cart.id);

        const item = items.find(
            (item) => item.id === itemId,
        );

        if (!item) {
            throw new NotFoundException(
                'Cart item không tồn tại',
            );
        }

       

        const plant = await this.plantRepository.findById(item.plant_id);

        if (!plant) {
            throw new NotFoundException(
                'Plant không tồn tại',
            );
        }

        if (plant.status !== PlantStatus.AVAILABLE) {
            throw new BadRequestException(
                'Plant chưa được bán',
            );
        }

        item.quantity = 1;

        return this.cartRepository.saveItem(item);
    }

    async removeItem(
        userId: number,
        itemId: number,
    ) {
        const cart = await this.getOrCreateCart(userId);

        const items = await this.cartRepository.findItems(
            cart.id,
        );

        const item = items.find(
            (item) => item.id === itemId,
        );

        if (!item) {
            throw new NotFoundException(
                'Cart item không tồn tại',
            );
        }

        await this.cartRepository.deleteItem(item);

        return {
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        };
    }
}