import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderIssue } from '../entities/order-issue.entity';


@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
    @InjectRepository(OrderIssue)
    private readonly orderIssueRepository: Repository<OrderIssue>,
  ) {}

  async createOrder(data: Partial<Order>): Promise<Order> {
    const order = this.repository.create(data);

    return this.repository.save(order);
  }

  async findById(id: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findBySellerId(sellerId: number): Promise<Order[]> {
    return this.repository.find({
      where: {
        seller_id: sellerId,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.repository.find({
      where: {
        user_id: userId,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findDetailByIdAndUserId(
    orderId: number,
    userId: number,
  ): Promise<{ order: Order; items: OrderItem[] } | null> {
    const order = await this.repository.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      return null;
    }

    const items = await this.repository.manager.find(OrderItem, {
      where: {
        order_id: orderId,
      },
    });

    return { order, items };
  }

  async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.repository.manager.find(OrderItem, {
      where: {
        order_id: orderId,
      },
    });
  }

  async findPendingOrders(): Promise<Order[]> {
    return this.repository.find({
      where: {
        status: OrderStatus.PENDING,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  
  async findAllOrders(options?: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Order[]; total: number }> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));

    const query = this.repository.createQueryBuilder('order');

    if (options?.status) {
      query.andWhere('order.status = :status', {
        status: options.status,
      });
    }

    const [data, total] = await query
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  
  async createIssue(data: Partial<OrderIssue>): Promise<OrderIssue> {
    const issue = this.orderIssueRepository.create(data);
    return this.orderIssueRepository.save(issue);
  }

  async findAllIssues(options?: {
    status?: import('../entities/order-issue.entity').OrderIssueStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: OrderIssue[]; total: number }> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));

    const query = this.orderIssueRepository.createQueryBuilder('issue');

    if (options?.status) {
      query.andWhere('issue.status = :status', {
        status: options.status,
      });
    }

    const [data, total] = await query
      .orderBy('issue.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findIssueById(id: number): Promise<OrderIssue | null> {
    return this.orderIssueRepository.findOne({
      where: { id },
    });
  }

  async saveIssue(issue: OrderIssue): Promise<OrderIssue> {
    return this.orderIssueRepository.save(issue);
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}