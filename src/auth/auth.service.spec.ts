import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/user/user.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService, JwtService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    const user = {
      id: '1',
      username: 'testuser',
      password: await bcrypt.hash('password', 10),
    };
    prisma.user.create = jest.fn().mockReturnValue(user);
    jwtService.sign = jest.fn().mockReturnValue('token');

    const result = await service.register('testuser', 'password');
    expect(result).toEqual({ token: 'token' });
  });

  it('should login a user', async () => {
    const user = {
      id: '1',
      username: 'testuser',
      password: await bcrypt.hash('password', 10),
    };
    prisma.user.findUnique = jest.fn().mockReturnValue(user);
    jwtService.sign = jest.fn().mockReturnValue('token');

    const result = await service.login('testuser', 'password');
    expect(result).toEqual({ token: 'token' });
  });
});
