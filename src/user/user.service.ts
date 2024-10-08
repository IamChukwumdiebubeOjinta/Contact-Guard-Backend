import { Injectable } from '@nestjs/common'; // Assuming you're using Prisma
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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

  async validateUser(
    usernameOrEmail: string,
    pass: string,
  ): Promise<any | undefined> {
    const user = await this.findByUsernameOrEmail(usernameOrEmail);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async update(id: string, data: Partial<User | null>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async create(data: { username: string; email: string; password: string }) {
    return this.prisma.user.create({ data });
  }
}
