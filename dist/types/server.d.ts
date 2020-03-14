import { IServer } from './interfaces/Iserver';
import { Services } from './Services';
export declare class Server extends Services {
    private port;
    constructor(config: IServer);
    start(): void;
}
