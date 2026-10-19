import { 
    Body, 
    Controller, 
    Get, 
    Post, 
    Patch,
    Param,
    ParseIntPipe,
    UseGuards, 
    Req} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('ADMIN')
        @Get()
        findAll() {
            return this.usersService.findAll();
        }

        @Post()
        create(@Body() dto: CreateUserDto) {
            console.log('Email:', dto.email);
            console.log('Password received:', typeof dto.password, !!dto.password);
            return this.usersService.create(dto);
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('ADMIN')
        @Patch(':id/suspend')
        suspendUser(
            @Param('id', ParseIntPipe) id: number, 
            @Req() req: any
        ) {
            console.log('JWT req.user:', req.user);
            return this.usersService.suspendUser(id, Number(req.user.userId));
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('ADMIN')
        @Patch(':id/restore')
        restoreUser(@Param('id', ParseIntPipe) id: number) {
            return this.usersService.restoreUser(id);
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('ADMIN')
        @Get(':id')
        findOne(@Param('id', ParseIntPipe) id: number) {
            return this.usersService.findOne(id);
        }

}