import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return result;
  }
  async findByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: {
      email,
    },
  });
}
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });
  }
}