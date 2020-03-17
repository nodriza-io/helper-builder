export interface IHelper {
  registerHelper: Function
  getHelpers: Function
}

export interface IServer {
    defaultDocId: String
    account: String
    apiKey: String
    model?: String
    port?: Number
}
  
 