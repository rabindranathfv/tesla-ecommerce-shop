import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().rawHeaders;

    return headers;
  },
);
