import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h', // hardcoded OR validated config
      },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
})
export class AuthModule {}