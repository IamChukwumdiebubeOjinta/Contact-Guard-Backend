import { Injectable } from '@nestjs/common'; // Assuming you're using Prisma
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * UsersService class provides methods to interact with the Prisma user model.
 * It uses the PrismaService to perform database operations.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string): Promise<any | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<any | undefined> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
  }

  async update(id: string, data: Partial<User | null>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async create(data: { username: string; email: string; password: string }) {
    return this.prisma.user.create({ data });
  }
}
