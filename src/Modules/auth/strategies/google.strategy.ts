import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "https://scout-talent-production-066a.up.railway.app/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { emails, name } = profile;
    const user = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email: emails?.[0]?.value,
      name:`${name?.givenName} ${name?.familyName}`,
    };

    done(null, user);
  }
}
