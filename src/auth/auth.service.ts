import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { hashSync, compareSync, genSaltSync } from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: hashSync(password, genSaltSync()),
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: await this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      ...user,
      token: await this.getJwtToken({ id: user.id }),
    };
  }

  // async checkAuthStatus(user: User) {
  //   return {
  //     ...user,
  //     token: this.getJwtToken({ id: user.id }),
  //   };
  // }

  private async getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    console.log(
      '🚀 ~ file: auth.service.ts:76 ~ AuthService ~ handleDBErrors ~ error:',
      error,
    );
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Please check server logs');
  }
}
