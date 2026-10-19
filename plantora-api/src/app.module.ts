import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SellerModule } from './seller/seller.module';
import { PlantModule } from './plant/plant.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { UserPlantModule } from './user-plant/user-plant.module';
import { AuditModule } from './audit/audit.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'mysql',

        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),

    UsersModule,
    AuthModule,
    SellerModule,
    AdminModule,
    PlantModule,
    OrderModule,
    CartModule,
    UserPlantModule,
    AuditModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}