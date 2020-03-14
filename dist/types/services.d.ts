import { IServer } from "./interfaces/Iserver";
export declare class Services {
    private Sdk;
    protected model: String | any;
    protected account: String;
    protected defaultDocId: String;
    constructor(config: IServer);
    getTemplate(): any;
    getDocument(): Promise<unknown>;
}
