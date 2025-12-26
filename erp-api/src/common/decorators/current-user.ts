import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
export const CurrentUser = createParamDecorator((data, ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest().user);
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
