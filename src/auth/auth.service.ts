import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user.
   *
   * @param {RegisterDto} user - The user registration data.
   * @return {Promise<{access_token: string, msg: string}>} - The access token for the newly created user.
   * @throws {ConflictException} - If the user already exists.
   */
  async register(
    user: RegisterDto,
  ): Promise<{ access_token: string; msg: string }> {
    const { username, email, password } = user;

    // Check if username already exists
    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const createdUser = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const payload = { username: createdUser.username, sub: createdUser.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    return {
      msg: 'User created successfully',
      access_token: accessToken,
    };
  }

  /**
   * Logs in a user using JWT.
   *
   * @param {LoginDto} user - The user object containing the username/email and password.
   * @return {Promise<{ access_token: string, refresh_token: string, msg: string }>} - A promise that resolves to an object containing the access and refresh tokens.
   */
  async login(
    user: LoginDto,
  ): Promise<{ access_token: string; refresh_token?: string; msg: string }> {
    const { usernameOrEmail, password } = user;

    // Validate user
    const validatedUser = await this.validateUser(usernameOrEmail, password);
    if (!validatedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(validatedUser);

    // Update refresh token in database
    await this.updateRefreshToken(validatedUser.id, tokens.refresh_token);

    return {
      msg: 'User logged in successfully',
      access_token: tokens.access_token,
    };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   *
   * @param {string} userId - The user's ID.
   * @param {string} refreshToken - The refresh token.
   * @return {Promise<{ access_token: string, refresh_token: string }>} - A promise that resolves to an object containing new access and refresh tokens.
   */
  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Logs out the user by clearing the refresh token.
   *
   * @param {string} userId - The user's ID.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Validates a user by checking the provided username/email and password.
   *
   * @param {string} usernameOrEmail - The username or email of the user to validate.
   * @param {string} pass - The password of the user to validate.
   * @return {Promise<any>} A promise that resolves to the validated user's information.
   */
  async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Generates access and refresh tokens for a user.
   *
   * @param {any} user - The user object.
   * @return {Promise<{ access_token: string, refresh_token: string }>} - A promise that resolves to an object containing the generated tokens.
   */
  private async generateTokens(
    user: any,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { username: user.username, sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Updates the refresh token for a user in the database.
   *
   * @param {string} userId - The user's ID.
   * @param {string} refreshToken - The new refresh token.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
}
