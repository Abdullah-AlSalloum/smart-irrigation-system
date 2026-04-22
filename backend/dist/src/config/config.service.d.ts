export declare class ConfigService {
    private readonly envConfig;
    constructor();
    get(key: string): string | undefined;
    getNumber(key: string): number;
    getBoolean(key: string): boolean;
    get databaseUrl(): string;
    get jwtSecret(): string;
    get jwtExpiration(): string;
    get port(): number;
    get nodeEnv(): string;
    get isDevelopment(): boolean;
    get esp32ApiTimeout(): number;
    get sensorDataInterval(): number;
    get moistureMinThreshold(): number;
    get moistureMaxThreshold(): number;
    get phMinThreshold(): number;
    get phMaxThreshold(): number;
    get temperatureMaxThreshold(): number;
}
