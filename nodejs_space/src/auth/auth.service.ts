import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, GoogleAuthDto, AppleAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private appleJwksClient: jwksClient.JwksClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.appleJwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Bu e-posta adresi zaten kayıtlı.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    this.logger.log(`User registered: ${user.email}`);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    this.logger.log(`User logged in: ${user.email}`);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }
    return this.sanitizeUser(user);
  }

  async googleAuth(dto: GoogleAuthDto) {
    try {
      // Verify the Google ID token
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`
      );

      const { email, name, sub: googleId } = response.data;

      if (!email) {
        throw new UnauthorizedException('Google hesabından e-posta alınamadı.');
      }

      // Find or create user
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user with Google
        user = await this.prisma.user.create({
          data: {
            email,
            googleId,
            fullName: name || null,
            passwordHash: '', // No password for OAuth users
          },
        });
        this.logger.log(`New user registered via Google: ${email}`);
      } else if (!user.googleId) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
        this.logger.log(`Google account linked for user: ${email}`);
      }

      const token = this.jwtService.sign({ sub: user.id, email: user.email });
      this.logger.log(`User logged in via Google: ${email}`);

      return {
        token,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error('Google auth error:', error?.message);
      throw new UnauthorizedException('Google ile giriş başarısız.');
    }
  }

  async appleAuth(dto: AppleAuthDto) {
    try {
      // Decode the Apple identity token header to get the key ID
      const decodedToken = jwt.decode(dto.identityToken, { complete: true }) as any;
      if (!decodedToken) {
        throw new UnauthorizedException('Geçersiz Apple token.');
      }

      const kid = decodedToken.header.kid;

      // Get Apple's public key
      const key = await this.appleJwksClient.getSigningKey(kid);
      const publicKey = key.getPublicKey();

      // Verify the token
      const payload = jwt.verify(dto.identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
      }) as any;

      const email = payload.email;
      const appleId = payload.sub;

      if (!email) {
        throw new UnauthorizedException('Apple hesabından e-posta alınamadı.');
      }

      // Find or create user
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user with Apple
        user = await this.prisma.user.create({
          data: {
            email,
            appleId,
            fullName: dto.fullName || null,
            passwordHash: '', // No password for OAuth users
          },
        });
        this.logger.log(`New user registered via Apple: ${email}`);
      } else if (!user.appleId) {
        // Link Apple account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { appleId },
        });
        this.logger.log(`Apple account linked for user: ${email}`);
      }

      const token = this.jwtService.sign({ sub: user.id, email: user.email });
      this.logger.log(`User logged in via Apple: ${email}`);

      return {
        token,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error('Apple auth error:', error?.message);
      throw new UnauthorizedException('Apple ile giriş başarısız.');
    }
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
