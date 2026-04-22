import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../common/database.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './auth.dto';
import { ConfigService } from '../../config/config.service';
export declare class AuthService {
    private db;
    private jwtService;
    private configService;
    constructor(db: DatabaseService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    generateToken(userId: string, email: string): Promise<string>;
    validateToken(token: string): Promise<any>;
}
