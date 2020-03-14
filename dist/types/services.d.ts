declare const axios: any;
interface IServices {
    sdk: any;
}
declare class Services {
    private Sdk;
    constructor(config: IServices);
    getTemplate(account: String, id: String, model: String): any;
    getDocument(model: String | any, id: String): Promise<unknown>;
}
