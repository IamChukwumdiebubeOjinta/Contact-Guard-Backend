import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  options: {
    issuer: 'hux-:fc',
    audience: 'hux-fc.gg',
    subject: 'hux-:user',
    expiresIn: '1y',
    algorithm: 'HS256',
  },
  secret: process.env.JWT_SECRET_KEY,
}));
