import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private configSer: ConfigService,
  ) {
    super({
      secretOrKey: configSer.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // TODO: Call validate if the token is valid
  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;
    const user = await this.userRepository.findOneBy({ email });
    console.log(
      '🚀 ~ file: jwt.strategy.ts:25 ~ JwtStrategy ~ validate ~ user:',
      user,
    );

    if (!user) {
      throw new UnauthorizedException(`token not valid`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(`user is inactive`);
    }
    return user;
  }
}
