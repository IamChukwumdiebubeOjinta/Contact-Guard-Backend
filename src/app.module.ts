import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ContactModule } from './contact/contact.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from './config/jwtConfig';

@Module({
  imports: [
    UserModule,
    ContactModule,
    PrismaModule,
    AuthModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
  ],
  providers: [JwtService, JwtStrategy],
})
export class AppModule {}
