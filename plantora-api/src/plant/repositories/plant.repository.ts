import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plant, PlantStatus } from '../entities/plant.entity';

@Injectable()
export class PlantRepository {
  constructor(
    @InjectRepository(Plant)
    private readonly repository: Repository<Plant>,
  ) {}

  async createPlant(data: Partial<Plant>) {
    const plant = this.repository.create(data);

    return this.repository.save(plant);
  }

  async findById(id: number) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findBySellerId(sellerId: number) {
    return this.repository.find({
      where: {
        seller_id: sellerId,
      },
    });
  }

  async save(plant: Plant) {
    return this.repository.save(plant);
  }

  async findAvailablePlants(
    search?: string,
    speciesId?: number,
    page = 1,
    limit = 10,
  ) {
    const query = this.repository
      .createQueryBuilder('plant')
      .where('plant.status = :status', {
        status: PlantStatus.AVAILABLE,
      });

    if (search) {
      query.andWhere('plant.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (speciesId) {
      query.andWhere('plant.species_id = :speciesId', {
        speciesId,
      });
    }

    const skip = (page - 1) * limit;

    query
      .skip(skip)
      .take(limit)
      .orderBy('plant.id', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async findAvailableById(plantId: number) {
    return this.repository.findOne({
      where: {
        id: plantId,
        status: PlantStatus.AVAILABLE,
      },
    });
  }

  async findByStatus(status: PlantStatus) {
    return this.repository.find({
      where: {
        status,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findAllPlants(
    search?: string,
    speciesId?: number,
    status?: PlantStatus,
    page = 1,
    limit = 10,
  ) {
    const query = this.repository.createQueryBuilder('plant');

    if (search) {
      query.andWhere('plant.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (speciesId) {
      query.andWhere('plant.species_id = :speciesId', {
        speciesId,
      });
    }

    if (status) {
      query.andWhere('plant.status = :status', {
        status,
      });
    }
  

    const skip = (page - 1) * limit;

    query
      .skip(skip)
      .take(limit)
      .orderBy('plant.id', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
    };
  }
}