import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { OrderRepository } from './repository/order.repository';
import { SellerRepository } from '../seller/seller.repository';

import { DataSource } from 'typeorm';

import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Plant, PlantStatus } from '../plant/entities/plant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order, PaymentStatus, OrderStatus } from './entities/order.entity';

import { OrderIssue, OrderIssueStatus } from './entities/order-issue.entity';
import { UserPlantRepository } from '../user-plant/repositories/user-plant.repository';

import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly sellerRepository: SellerRepository,
        private readonly dataSource: DataSource,
        private readonly userPlantRepository: UserPlantRepository,
    ) {}

    async getMyOrders(userId: number) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
        throw new NotFoundException(
            'Seller profile not found',
        );
        }

        return this.orderRepository.findBySellerId(
            seller.id,
        );
    }

    async confirmOrder(
        userId: number,
        orderId: number,
    ) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException(
                'Seller profile not found',
            );
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(
                'Order not found',
            );
        }

        if (order.seller_id !== seller.id) {
            throw new ForbiddenException(
                'You are not allowed to process this order',
            );
        }

        if (order.status !== 'PENDING') {
            throw new BadRequestException(
                'Only PENDING orders can be confirmed',
            );
        }

        order.status = OrderStatus.CONFIRMED;

        return this.orderRepository.save(order);
    }

    async processOrder(
        userId: number,
        orderId: number,
    ) {
        const seller =  await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException(
                'Seller profile not found',
            );
        }   

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(
                'Order not found',
            );
        } 

        if (order.seller_id !== seller.id) {
            throw new ForbiddenException(
                'You are not allowed to process this order',
            );
        }
    

        if (order.status !== OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                'Only CONFIRMED orders can be processed',
            );
        }

        order.status = OrderStatus.PROCESSING;

        return this.orderRepository.save(order);
    }

    async shipOrder(userId: number, orderId: number) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException(
                'Seller profile not found',
            );
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(
                'Order not found',
            );
        }

        if (order.seller_id !== seller.id) {
            throw new ForbiddenException(
                'You are not allowed to process this order',
            );
        }

        if (order.status !== OrderStatus.PROCESSING) {
            throw new BadRequestException(
                'Only PROCESSING orders can be shipped',
            );
        }

        order.status = OrderStatus.SHIPPED;

        return this.orderRepository.save(order);
    }

    async deliverOrder(userId: number, orderId: number) {
        const seller = await this.sellerRepository.findByUserId(userId);

        if (!seller) {
            throw new NotFoundException(
                'Seller profile not found',
            );
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException(
                'Order not found',
            );
        }

        if (order.seller_id !== seller.id) {
            throw new ForbiddenException(
                'You are not allowed to process this order',
            );
        }

        if (order.status !== OrderStatus.SHIPPED) {
            throw new BadRequestException(
                'Only SHIPPED orders can be delivered',
            );
        }

        const items = await this.orderRepository.findItemsByOrderId(orderId);

        if (items.length === 0) {
            throw new BadRequestException(
                'Order has no items',
            );
        }
    

        order.status = OrderStatus.DELIVERED;

        const savedOrder = await this.orderRepository.save(order);

        for (const item of items) {
            const userPlant = {
                user_id: order.user_id,
                plant_id: item.plant_id,
                order_item_id: item.id,
                acquired_at: new Date(),
                nickname: null,
            };

            await this.userPlantRepository.create(userPlant);
        }

        return savedOrder;
    }


    async checkout(userId: number, checkoutDto: CheckoutDto) {
        return this.dataSource.transaction(async (manager) => {
            // 1. Tìm giỏ hàng của người dùng
            const cart = await manager.findOne(Cart, {
                where: { user_id: userId },
            });

            if (!cart) {
                throw new NotFoundException('Cart not found');
            }

            // 2. Lấy danh sách sản phẩm trong giỏ hàng
            const cartItems = await manager.find(CartItem, {
                where: { cart_id: cart.id },
            });

            if (cartItems.length === 0) {
                throw new BadRequestException('Cart is empty');
            }

            // 3. Kiểm tra từng sản phẩm
            const validatedItems: {
                cartItem: CartItem;
                plant: Plant;
                unitPrice: number;
                lineTotal: number;
            }[] = [];

            for (const item of cartItems) {

                // Mỗi Plant là một cây thực tế cụ thể
                if (item.quantity !== 1) {
                    throw new BadRequestException(
                        'Mỗi cây thực tế chỉ được mua 1 lần',
                    );
                }

                // Tìm cây và khóa bản ghi để tránh cập nhật tồn kho đồng thời
                const plant = await manager.findOne(Plant, {
                    where: { id: item.plant_id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!plant) {
                    throw new NotFoundException(
                        `Plant ${item.plant_id} not found`,
                    );
                }

                // Kiểm tra trạng thái cây
                if (plant.status !== PlantStatus.AVAILABLE) {
                    throw new BadRequestException(
                        `Plant ${plant.name} is not available`,
                    );
                }

                // Kiểm tra giá
                const unitPrice = Number(plant.price);

                if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
                    throw new BadRequestException(
                        `Plant ${plant.name} has an invalid price`,
                    );
                }

                // Mỗi Plant là một cây thực tế cụ thể
                if (plant.quantity < 1) {
                    throw new BadRequestException(
                        `Plant ${plant.name} is no longer available`,
                    );
                }

                // Lưu sản phẩm đã kiểm tra
                validatedItems.push({
                    cartItem: item,
                    plant,
                    unitPrice,
                    lineTotal: unitPrice * item.quantity,
                });
            }

            // 4. Nhóm sản phẩm theo người bán
            const itemsBySeller = new Map<number, typeof validatedItems>();

            for (const item of validatedItems) {
                const sellerId = item.plant.seller_id;

                if (!itemsBySeller.has(sellerId)) {
                    itemsBySeller.set(sellerId, []);
                }

                itemsBySeller.get(sellerId)!.push(item);
            }

            // 5. Tạo Order cho từng người bán
            const createdOrders: Order[] = [];

            for (const [sellerId, items] of itemsBySeller.entries()) {
                const totalAmount = items.reduce(
                    (sum, item) => sum + item.lineTotal,
                    0,
                );

                const order = manager.create(Order, {
                    user_id: userId,
                    seller_id: sellerId,
                    total_amount: totalAmount,
                    status: OrderStatus.PENDING,
                    payment_status: PaymentStatus.UNPAID,
                    shipping_name: checkoutDto.shipping_name,
                    shipping_phone: checkoutDto.shipping_phone,
                    shipping_address: checkoutDto.shipping_address,
                });

                const savedOrder = await manager.save(Order, order);

                // Tạo các OrderItem thuộc Order vừa tạo
                const orderItems = items.map((item) =>
                    manager.create(OrderItem, {
                        order_id: savedOrder.id,
                        plant_id: item.plant.id,
                        quantity: item.cartItem.quantity,
                        unit_price: item.unitPrice,
                    })
                );

                await manager.save(OrderItem, orderItems);

                // Trừ số lượng cây trong kho
                    for (const item of items) {
                        item.plant.quantity -= item.cartItem.quantity;

                        await manager.save(Plant, item.plant);
                    }

                createdOrders.push(savedOrder);
            }

            // 6. Xóa các sản phẩm đã checkout khỏi giỏ
            await manager.delete(CartItem, {
                cart_id: cart.id,
            });

            // 7. Trả về kết quả
            return {
                message: 'Orders created successfully',
                orders: createdOrders,
            };
        });
    }

    async getCustomerOrders(userId: number) {
        return this.orderRepository.findByUserId(userId);
    }

    async getCustomerOrderDetail(userId: number, orderId: number) {
        const result = await this.orderRepository.findDetailByIdAndUserId(
            orderId,
            userId,
        );

        if (!result) {
            throw new NotFoundException('Order not found');
        }

        return result;
    }

    async getOwnedPlants(userId: number) {
        return this.userPlantRepository.findByUserId(userId);
    }

    async findAllOrders(options?: {
        status?: OrderStatus;
        page?: number;
        limit?: number;
    }) {
        return this.orderRepository.findAllOrders(options);
    }

    
    async getAdminOrderDetail(orderId: number) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const items = await this.orderRepository.findItemsByOrderId(orderId);

        return {
            order,
            items,
        };
    }

    async cancelOrderByAdmin(
        orderId: number,
        reason: string,
    ) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (
            order.status === OrderStatus.SHIPPED ||
            order.status === OrderStatus.DELIVERED ||
            order.status === OrderStatus.CANCELLED
        ) {
            throw new BadRequestException(
                'This order cannot be cancelled',
            );
        }

        if (!reason || !reason.trim()) {
            throw new BadRequestException(
                'Cancellation reason is required',
            );
        }

        order.status = OrderStatus.CANCELLED;
        order.cancellation_reason = reason.trim();

        return this.orderRepository.save(order);
    }

    
    async reportOrderIssue(
        orderId: number,
        reportedBy: number,
        description: string,
    ) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.user_id !== reportedBy) {
            throw new ForbiddenException(
                'Bạn chỉ có thể báo cáo sự cố đối với các đơn hàng của chính mình',
            );
        }
        if (!description || !description.trim()) {
            throw new BadRequestException(
                'Issue description is required',
            );
        }

        return this.orderRepository.createIssue({
            order_id: orderId,
            reported_by: reportedBy,
            description: description.trim(),
            status: OrderIssueStatus.OPEN,
            resolution_note: null,
        });
    }
   
    async resolveOrderIssue(
        issueId: number,
        resolutionNote: string,
    ) {
        const issue = await this.orderRepository.findIssueById(issueId);

        if (!issue) {
            throw new NotFoundException('Order issue not found');
        }

        if (!resolutionNote || !resolutionNote.trim()) {
            throw new BadRequestException(
                'Resolution note is required',
            );
        }

        if (issue.status === OrderIssueStatus.RESOLVED) {
            throw new BadRequestException(
                'This issue has already been resolved',
            );
        }

        issue.status = OrderIssueStatus.RESOLVED;
        issue.resolution_note = resolutionNote.trim();

        return this.orderRepository.saveIssue(issue);
    }

    async findAllIssues(options?: {
        status?: OrderIssueStatus;
        page?: number;
        limit?: number;
    }) {
        return this.orderRepository.findAllIssues(options);
    }
 
}