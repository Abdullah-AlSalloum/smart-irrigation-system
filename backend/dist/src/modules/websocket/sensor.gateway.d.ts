import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SensorGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private clientsByDevice;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, data: {
        deviceId: string;
    }): void;
    handleUnsubscribe(client: Socket, data: {
        deviceId: string;
    }): void;
    handleSensorDataReceived(payload: any): void;
    handlePumpStatusChanged(payload: any): void;
    handleAlertCreated(payload: any): void;
    handleDeviceOffline(payload: any): void;
    handleAutomationAction(payload: any): void;
    handleMessage(client: Socket, data: {
        deviceId: string;
        message: string;
    }): void;
}
