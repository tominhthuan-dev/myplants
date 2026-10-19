import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantModeration } from '../entities/plant-moderation.entity';

@Injectable()
export class PlantModerationRepository {
  constructor(
    @InjectRepository(PlantModeration)
    private readonly repository: Repository<PlantModeration>,
  ) {}

  async createModeration(
    data: Partial<PlantModeration>,
  ) {
    const moderation =
      this.repository.create(data);

    return this.repository.save(moderation);
  }
}