import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartRepository {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,

        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
    ) {}

    //tìm cart của user theo userId
    async findByUserId(userId: number) {
        return this.cartRepository.findOne({
            where: { user_id: userId },
        });
    }

    //tạo cart mới cho user
    async createCart(userId: number) {
        const cart = this.cartRepository.create({
            user_id: userId,
        });

        return this.cartRepository.save(cart);
    }

    //xem plant đó đã có trong cart chưa
    async findItem(cartId: number, plantId: number) {
        return this.cartItemRepository.findOne({
            where: {
                cart_id: cartId,
                plant_id: plantId,
            },
        });
    }

    //lấy tất cả các item trong cart
    async findItems(cartId: number) {
        return this.cartItemRepository.find({
            where: { cart_id: cartId },
            order: { id: 'ASC' },
        });
    }

    //tạo item mới trong cart
    async createItem(
        cartId: number,
        plantId: number,
        quantity: number,
    ) {
        const item = this.cartItemRepository.create({
            cart_id: cartId,
            plant_id: plantId,
            quantity,
        });

        return this.cartItemRepository.save(item);
    }

    //cập nhật item trong cart
    async saveItem(item: CartItem) {
        return this.cartItemRepository.save(item);
    }

    //xóa item trong cart
    async deleteItem(item: CartItem) {
        return this.cartItemRepository.remove(item);
    }
}