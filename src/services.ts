import { IServer } from "./interfaces/Iserver"

const Nodriza = require('nodriza')
const axios = require('axios')

export class Services {
  
  private Sdk: any
  protected model: String|any
  protected account: String
  protected defaultDocId: String

  constructor (config: IServer) {
    this.account = config.account
    this.model = config.model
    this.defaultDocId = config.defaultDocId
    if (this.account) this.account += '.nodriza.io'
    this.Sdk = new Nodriza ({ hostname: this.account, accessToken: config.apiKey })
  }

  getTemplate (): any {
    return new Promise((resolve: Function, reject: Function) => {
      const url = `https://${this.account}/v1/document/${this.model}/${this.defaultDocId}/html?source=none&rand=${new Date().getTime()}`
      axios(url).then((response: any) => {
        resolve(response.data)
      }).catch((err: any) => {
        reject(JSON.stringify(err))
      })
    })
  }
  
  getDocument () {
      return new Promise((resolve: Function, reject: Function) => {
        this.Sdk.api[this.model]?.findOne(this.defaultDocId, (err: any, doc: any) => {
          if (err) return reject(err)
          resolve(doc)
        }) 
      })
  }

}
