import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';

import { User, UserStatus, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly auditService: AuditService,
    ) {}

    async findAll() {
        const users = await this.userRepository.findAll();

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }));
    }

    async create(dto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const savedUser = await this.userRepository.createUser({
            email: dto.email,
            password_hash: hashedPassword,
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
        });

        return {
            id: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
            status: savedUser.status,
            created_at: savedUser.created_at,
            updated_at: savedUser.updated_at,
        };
    }

    async suspendUser(userId: number, actorId: number) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }

        if (user.status === UserStatus.SUSPENDED) {
            throw new BadRequestException('User đã bị khóa');
        }

        user.status = UserStatus.SUSPENDED;

        const savedUser = await this.userRepository.save(user);

        await this.auditService.createLog({
            actor_id: actorId,
            action: 'SUSPEND_USER',
            target_type: 'USER',
            target_id: savedUser.id,
            details: {
                email: savedUser.email,
                previous_status: UserStatus.ACTIVE,
                new_status: UserStatus.SUSPENDED,
            },
        });

        return {
            id: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
            status: savedUser.status,
            created_at: savedUser.created_at,
            updated_at: savedUser.updated_at,
        };
    }

    async restoreUser(userId: number) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }

        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('User đang hoạt động');
        }

        user.status = UserStatus.ACTIVE;

        const savedUser = await this.userRepository.save(user);

        return {
            id: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
            status: savedUser.status,
            created_at: savedUser.created_at,
            updated_at: savedUser.updated_at,
        };
    }

    async findOne(userId: number) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
}