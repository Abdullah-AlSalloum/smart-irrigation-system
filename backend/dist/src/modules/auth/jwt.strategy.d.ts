import { ConfigService } from '../../config/config.service';
import { DatabaseService } from '../../common/database.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private db;
    constructor(configService: ConfigService, db: DatabaseService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        name: string;
    }>;
}
export {};
