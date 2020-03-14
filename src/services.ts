const axios = require('axios')

interface IConstructor {
  sdk: any 
}

class Services {
  
  private Sdk: any

  constructor (config: IConstructor) {
    this.Sdk = config.sdk
  }

  getTemplate (account: String, id: String, model: String): any {
    return new Promise((resolve: Function, reject: Function) => {
      const url = `https://${account}/v1/document/${model}/${id}/html?source=none&rand=${new Date().getTime()}`
      axios(url).then((response: any) => {
        resolve(response.data)
      }).catch((err: any) => {
        reject(err.response.data)
      })
    })
  }
  
  getDocument (model: String|any, id: String) {
      return new Promise((resolve: Function, reject: Function) => {
        this.Sdk.api[model]?.findOne(id, (err: any, doc: any) => {
          if (err) return reject(err)
          resolve(doc)
        }) 
      })
  }

}


module.exports = Services
