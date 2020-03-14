"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Services_1 = require("./Services");
const path = require('path');
const express = require('express');
class Server extends Services_1.Services {
    constructor(config) {
        super(config);
        const { port } = config;
        this.port = port;
    }
    start() {
        let reload = true;
        const app = express();
        const server = require('http').Server(app);
        const io = require('socket.io')(server);
        app.set('views', __dirname);
        app.engine('html', require('ejs').renderFile);
        app.use(express.static(path.join(__dirname, 'public')));
        io.on('connection', (socket) => {
            if (reload)
                socket.emit('reload');
            reload = false;
        });
        app.get('/', (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let template = yield this.getTemplate();
                const html = '<div class="nf-html-editor">' + '<div class="trumbowyg-editor viewer"><h1>Wilmar Ibarguen</h1></div>';
                template = template.replace(/<div class="nf-html-editor">/gi, html);
                const doc = yield this.getDocument();
                doc === null || doc === void 0 ? true : delete doc.layout;
                doc === null || doc === void 0 ? true : delete doc.content;
                res.render('index.html', { template, doc: JSON.stringify(doc), port: this.port, docId: this.defaultDocId });
            }
            catch (err) {
                console.log(err);
                res.render('index.html', { template: err, doc: JSON.stringify({}), port: this.port, docId: this.defaultDocId });
            }
        }));
        server.listen(this.port, () => {
            console.log('server started at http://localhost:' + this.port);
        });
    }
}
exports.Server = Server;
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
//# sourceMappingURL=server.js.map