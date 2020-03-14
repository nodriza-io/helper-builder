import { Request, Response } from 'express'
import { Socket } from 'socket.io'
import { IServer } from './interfaces/Iserver'
import { Services } from './Services'

const path = require('path')
const express = require('express')

export class Server extends Services {
  
  private port: String
  private exampleText: String = 'exampleText'
  
  constructor(config: IServer) {
    super(config)
    const { port } = config
    this.port = port
  }

  setExampleText (text: String) {
    this.exampleText = text
  }

  start () {
    let reload: Boolean = true
    const app = express()
    const server = require('http').Server(app)
    const io = require('socket.io')(server)
    app.set('views', __dirname)
    app.engine('html', require('ejs').renderFile)
    app.use(express.static(path.join(__dirname, 'public')))
    io.on('connection', (socket: Socket ) => {
      if (reload) socket.emit('reload')
      reload = false 
    })
    app.get('/', async (_req: Request, res: Response) => {
      try {
        let template: String = await this.getTemplate()
        const html: any = '<div class="nf-html-editor">' + '<div class="trumbowyg-editor viewer">'+this.exampleText+'</div>'
        template = template.replace(/<div class="nf-html-editor">/gi, html)
        const doc: any = await this.getDocument()
        delete doc?.layout
        delete doc?.content
        res.render('index.html', { template, doc: JSON.stringify(doc), port: this.port, docId: this.defaultDocId })
      } catch (err) {
        console.log(err)
        res.render('index.html', { template: err, doc: JSON.stringify({}), port: this.port, docId: this.defaultDocId })
      }
    })
    server.listen(this.port, () => {
      console.log('server started at http://localhost:'+this.port);
    })
  }

}




// if (!process.env.ACCOUNT) throw new Error('Account envairoment does not valid')
// if (!process.env.API_KEY) throw new Error('ApiKey envairoment does not valid')

// const  path = require('path')
// require('dotenv').config({
//   path: path.resolve(__dirname)
// })
// const { PORT = 3003 } = process.env
// const app = express()
// const server = require('http').Server(app)
// const io = require('socket.io')(server)
// const hostname = process.env.ACCOUNT + '.nodriza.io'
// const accessToken = process.env.API_KEY
// const sdk = new Nodriza({ hostname, accessToken })
// const services = new Services({ sdk })
// let reload = true
// app.set('views', __dirname)
// app.engine('html', require('ejs').renderFile)
// app.use(express.static(path.join(__dirname, 'public')))
// io.on('connection', (socket: Socket ) => {
//   if (reload) socket.emit('reload')
//   reload = false 
// })
// app.get('/', async (req: Request, res: Response) => {
//   try {
//     const id = req.query?.docId
//     const model = req.query?.model
//     let template: String = await services.getTemplate(hostname, id, model)
//     const html: any = '<div class="nf-html-editor">' + '<div class="trumbowyg-editor viewer"><h1>Wilmar Ibarguen</h1></div>'
//     template = template.replace(/<div class="nf-html-editor">/gi, html)
//     const doc = await services.getDocument(model, id)
//     delete doc?.layout
//     delete doc?.content
//     res.render('index.html', { template, doc: JSON.stringify(doc), port: PORT, docId: process.env.DOC_ID })
//   } catch (err) {
//     console.log(err)
//     res.render('index.html', { template: err, doc: JSON.stringify({}), port: PORT, docId: process.env.DOC_ID })
//   }
// })
// server.listen(PORT, () => {
//   console.log('server started at http://localhost:'+PORT);
// })

// module.exports = {
//   serve () {
//   }
// }

