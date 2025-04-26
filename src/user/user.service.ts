import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@generated/client';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { RedisService } from '@/redis/redis.service';
import { md5 } from '@/lib/utils';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async login(user: LoginDto): Promise<Omit<User, 'password'>> {
    const captcha = await this.redis.get(`captcha_${user.email}`);
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== user.captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.prisma.user.findFirst({
      where: {
        email: user.email,
        password: md5(user.password),
      },
    });
    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    const { password: _, ...userWithoutPassword } = foundUser;
    return userWithoutPassword;
  }
  async createUser(user: CreateUserDto): Promise<Omit<User, 'password'>> {
    const captcha = await this.redis.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (captcha !== user.captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.prisma.user.findFirst({
      where: {
        username: user.username,
      },
    });
    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const { password, captcha: _captcha, ...userData } = user;
    const hashedPassword = md5(password);

    const createdUser = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }
  async getCaptcha(email: string) {
    const captcha = await this.redis.get(`captcha_${email}`);
    if (captcha) {
      throw new HttpException('验证码已存在', HttpStatus.BAD_REQUEST);
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`captcha_${email}`, code, 60 * 10);
    return code;
  }
}
