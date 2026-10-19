import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/\S/, {
    message: 'Tên người nhận không được chỉ chứa khoảng trắng',
  })
  shipping_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[0-9+\-().\s]+$/, {
    message: 'Số điện thoại chứa ký tự không hợp lệ',
  })
  @Matches(/^(?=(?:\D*\d){9,15}\D*$)[0-9+\-().\s]+$/, {
    message: 'Số điện thoại phải có từ 9 đến 15 chữ số',
  })
  shipping_phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Matches(/\S/, {
    message: 'Địa chỉ không được chỉ chứa khoảng trắng',
  })
  shipping_address: string;
}