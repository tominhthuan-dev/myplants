import { IsIn, IsInt, IsPositive } from 'class-validator';

export class AddCartItemDto {
  @IsInt({ message: 'plant_id phải là số nguyên' })
  @IsPositive({ message: 'plant_id phải lớn hơn 0' })
  plant_id: number;

  @IsInt({ message: 'quantity phải là số nguyên' })
  @IsIn([1], { message: 'Mỗi cây thực tế chỉ được mua 1 lần' })
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt({ message: 'quantity phải là số nguyên' })
  @IsIn([1], { message: 'Mỗi cây thực tế chỉ được mua 1 lần' })
  quantity: number;
}