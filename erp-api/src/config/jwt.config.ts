import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES || '24h', // Extended for production use
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
  issuer: 'Navbahor-ERP-System',
  audience: 'Cotton-Factory-Users',
}));