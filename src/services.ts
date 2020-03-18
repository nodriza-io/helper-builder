import { helpers, create } from "handlebars"
import { IServer, IHelper } from "./types"

const Nodriza = require('nodriza')
const axios = require('axios')

export class Services {
  
  private Sdk: any
  private apiKey: String
  protected model: String|any
  protected account: String
  protected defaultDocId: String

  constructor (config: IServer) {
    this.account = config.account
    this.model = config.model
    this.apiKey = config.apiKey
    this.defaultDocId = config.defaultDocId
    if (this.account) this.account += '.nodriza.io'
    this.Sdk = new Nodriza ({ hostname: this.account, accessToken: config.apiKey })
  }

  protected getTemplate () {
    return new Promise((resolve: Function, reject: Function) => {
      const url = `https://${this.account}/v1/document/${this.model}/${this.defaultDocId}/html?source=none&rand=${new Date().getTime()}`
      axios(url).then((response: any) => {
        resolve(response.data)
      }).catch((err: any) => {
        reject(err.toString())
      })
    })
  }

  protected findHelper (keyname: String) {
    return new Promise((resolve: Function, reject: Function) => {
      this.Sdk.api?.helperBuilder?.findOne(keyname, (err: any, doc: any) => {
        if (err) return resolve({})
        resolve(doc)
      }) 
    })
  }

  protected createHelper (helper: Object) {
    return new Promise((resolve: Function, reject: Function) => {
      this.Sdk.api?.helperBuilder?.create(helper, (err: any, doc: any) => {
        if (err) return reject(err)
        resolve(doc)
      }) 
    })
  }

  protected updateHelper (keyname: String, helper: Object) {
    return new Promise((resolve: Function, reject: Function) => {
      this.Sdk.api?.helperBuilder?.update(keyname, helper, (err: any, doc: any) => {
        if (err) return reject(err)
        resolve(doc)
      }) 
    })
  }

  protected exportHelper (helper:any) {
    return new Promise(async (resolve: Function, reject: Function) => {
      try {
        const payload = {
          type: 'proposal',
          keyname: helper.name,
          helper: helper.func,
          usage: helper.usage,
        }
        const doc:any = await this.findHelper(helper.name)
        if (doc?.id) return resolve({ updated: await this.updateHelper(doc.keyname, payload) })
        resolve({ created: await this.createHelper(payload) })
      } catch (err) {
        resolve(err)
      }
    })
  }

  protected exportHelpers (helpers: any[]) {
    return Promise.all(helpers.map(helper => this.exportHelper(helper)))
  }
 
  protected getDocument () {
    return new Promise((resolve: Function, reject: Function) => {
      this.Sdk.api[this.model]?.findOne(this.defaultDocId, (err: any, doc: any) => {
        if (err) return reject(err)
        resolve(doc)
      }) 
    })
  }

}
