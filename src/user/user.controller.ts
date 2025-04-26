import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@generated/client';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { EmailService } from '@/email/email.service';
import { RedisService } from '@/redis/redis.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(RedisService)
  private readonly redis: RedisService;

  @Get()
  async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }
  @Post('login')
  async login(@Body() loginInfo: LoginDto) {
    return this.userService.login(loginInfo);
  }
  @Post('create')
  async createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }
  @Get('register/captcha')
  async getCaptcha(@Query('email') email: string) {
    const captcha = await this.redis.get(`captcha_${email}`);
    if (captcha) {
      throw new HttpException('验证码已存在', HttpStatus.BAD_REQUEST);
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`captcha_${email}`, code, 60 * 10);
    await this.emailService.sendMail({
      to: email,
      subject: '注册验证码',
      html: `<p>你的验证码是：${code}</p>`,
    });
    return '验证码已发送';
  }
}
