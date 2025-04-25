import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(3, { message: '密码长度至少需要3位' }) // 实际项目中应有更强的密码策略
  @MaxLength(50, { message: '密码长度不能超过50个字符' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;

  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  @MaxLength(50, { message: '昵称长度不能超过50个字符' })
  nick_name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @MaxLength(50, { message: '邮箱长度不能超过50个字符' })
  email: string;

  @IsOptional() // 标记为可选
  @IsString()
  @MaxLength(100, { message: '头像地址长度不能超过100个字符' })
  head_pic?: string; // 类型也设为可选

  @IsOptional() // 标记为可选
  @IsString()
  @MaxLength(100, { message: '手机号码长度不能超过100个字符' })
  phone_number?: string; // 类型也设为可选
}
