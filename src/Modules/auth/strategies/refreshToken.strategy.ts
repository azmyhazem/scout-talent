import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies) => req?.cookies?.refreshToken ?? null,
      ]),
      secretOrKey: process.env.JWT_Refresh_SECRET!,
      passReqToCallback: true,
    });
  }

  validate(req: RequestWithCookies) {
    const refreshToken = req.cookies?.refreshToken;

    return { refreshToken };
  }
}