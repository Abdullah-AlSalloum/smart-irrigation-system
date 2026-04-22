import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../common/database.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './auth.dto';
import { ConfigService } from '../../config/config.service';

/**
 * Kimlik Doğrulama Servis
 * Kullanıcı kaydı, girişi ve token yönetimi
 */
@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Kullanıcı Kayıt / User Registration
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, name, password } = registerDto;

    // Email zaten kayıtlı mı kontrol et
    const existingUser = await this.db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email zaten kayıtlı');
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const user = await this.db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Token oluştur
    const token = await this.generateToken(user.id, user.email);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Kullanıcı Girişi / User Login
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Kullanıcı bul
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Şifre kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Token oluştur
    const token = await this.generateToken(user.id, user.email);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * JWT Token Oluştur / Generate JWT Token
   */
  async generateToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwtService.signAsync(payload);
  }

  /**
   * Token Doğrula / Validate Token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Geçersiz token');
    }
  }
}
