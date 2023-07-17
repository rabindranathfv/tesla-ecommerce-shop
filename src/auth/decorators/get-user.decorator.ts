import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  if (!user) {
    throw new InternalServerErrorException(`user not found in Req`);
  }

  const userMaped = data?.reduce((current, next) => {
    current[next] = user[next];
    return current;
  }, {});

  return !data ? user : userMaped;
});
