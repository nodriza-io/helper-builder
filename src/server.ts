import { Request, Response } from 'express'
import { Socket } from 'socket.io'
import Handlebars, { helpers } from 'handlebars'
import { IServer } from './interfaces/IServer'
import { IHelper } from './interfaces/IHelper'
import { Services } from './Services'

const path = require('path')
const cors = require('cors')
const express = require('express')
const getFunctionArgs = require('get-function-args-x').default

type HelperOptions = {
  helperName?:string
  description: string
  argsDefinition:object
}

export class Server extends Services implements IHelper {
  
  private port: String
  private helperOptions: HelperOptions[] = []
  private isReloadAdllPage: Boolean
  private exampleText: String = 'exampleText'
  
  constructor(config: IServer) {
    super(config)
    const { port } = config
    this.port = port
  }
  
  // @override
  registerHelper (name: string, helper: Handlebars.HelperDelegate, options?:HelperOptions) {
    Handlebars.registerHelper(name, helper)
    let argsDefinition = {}
    let description = 'Description does not available'
    if (options?.description) description = options.description
    if (options?.argsDefinition) argsDefinition = options.argsDefinition
    this.helperOptions.push({ helperName: name, description, argsDefinition })
  }
  
  // @override
  getHelpers () {
    return Object.keys(Handlebars.helpers).filter(helper => {
      return /^custom.*$/gi.test(helper)
    }).sort().map(helper => {
      const helperFcn = Handlebars.helpers[helper]
      const params = getFunctionArgs(helperFcn).map((param: String) => {
        const params = param.split('=')
        let helperParam = params[1] ? params[1] : params[0]
        return helperParam.replace(/["'`]/g, '').trim()
      })
      return { 
        name: helper, 
        helper: helperFcn,
        description: this.getHelperOptions(helper).description,
        argsDefinition: this.getHelperOptions(helper).argsDefinition,
        func: helperFcn.toString(),
        params: params,
        usage: `{{{ ${helper} ${params.map((p:string) => `"${p}"`).join(' ')} }}}`,
      }
    })
  }

  private getHelperOptions (helper: String) {
    let description:any = this.helperOptions.filter(desc => desc.helperName === helper)
    return description.pop()
  }
  
  private buildHelperBlock (name: String, params: String[]) {
    return `<div data-helper="${name}">{{{${name} ${params.join(' ')}}}}</div>`
  }

  private getGelpersBlock () {
    return this.getHelpers().map(helper => {
      return this.buildHelperBlock(helper.name, helper.params)
    }).join('')
  }

  private getGelperBlock (helperName: string) {
    return this.getHelpers().filter(h => h.name === helperName).map(helper => {
      return this.buildHelperBlock(helper.name, helper.params)
    }).join('')
  }

  private responseTemplate (res:Response, template:String, doc:Object) {
    res.render('index.html', { 
      template: template, 
      doc: JSON.stringify(doc), 
      port: this.port, 
      docId: this.defaultDocId,
      helpers: JSON.stringify(this.getHelpers().map(helper => {
        const func = helper.helper.toString()
        const usage = `{{{ ${helper.name} ${helper.params.map((p:string) => `"${p}"`).join(' ')} }}}`
        return Object.assign(helper, { func, usage })
      })),
    })
  }

  private getCompile (doc: Object, template: String) {
    return Handlebars.compile(Handlebars.compile(template)({}))(doc)
  }

  setReloadAddPage (val: Boolean) {
    this.isReloadAdllPage = val
  }

  start () {
    let reload: Boolean = true
    const app = express()
    const server = require('http').Server(app)
    const io = require('socket.io')(server)
    app.set('views', __dirname)
    app.engine('html', require('ejs').renderFile)
    app.use(cors())
    app.use(express.static(path.join(__dirname, 'app')))
    io.on('connection', (socket: Socket ) => {
      if (reload) socket.emit(this.isReloadAdllPage ? 'reload-all' : 'reload')
      reload = false 
    })
    app.get('/doc/json', async (_req: Request, res: Response) => {
      try {
        const doc:any = await this.getDocument()
        delete doc?.layout
        delete doc?.content
        res.json(doc)
      } catch (err) {
        res.status(400).send(err)
      }
    })
    app.get('/helpers', async (_req: Request, res: Response) => {
      try {
        res.json(await this.getHelpers())
      } catch (err) {
        res.status(400).send(err)
      }
    })
    app.get('/helper/:helper', async (_req: Request, res: Response) => {
      try {
        let template:string = await this.getTemplate()
        const doc: any = await this.getDocument()
        const helper:string = _req?.params?.helper
        delete doc?.layout
        delete doc?.content
        const replace = `
          <div class="nf-html-editor">
            <div class="trumbowyg-editor viewer">${this.getGelperBlock(helper)}</div>
        `
        template = template.replace(/<div class="nf-html-editor">/gi, replace)
        template = this.getCompile(doc, template)
        this.responseTemplate(res, template, doc)
      } catch (err) {
        console.log(err)
        this.responseTemplate(res, err, {})
      }
    })
    app.get('/', async (_req: Request, res: Response) => {
      try {
        res.render('app/index.html', {})
        // let template:string = await this.getTemplate()
        // const doc: any = await this.getDocument()
        // delete doc?.layout
        // delete doc?.content
        // const replace = `
        //   <div class="nf-html-editor">
        //     <div class="trumbowyg-editor viewer">${this.getGelpersBlock()}</div>
        // `
        // template = template.replace(/<div class="nf-html-editor">/gi, replace)
        // template = this.getCompile(doc, template)
        // this.responseTemplate(res, template, doc)
      } catch (err) {
        console.log(err)
        res.status(500).send(err)
        // this.responseTemplate(res, err, {})
      }
    })
    server.listen(this.port, () => {
      console.log('server started at http://localhost:'+this.port);
    })
  }
  
}
