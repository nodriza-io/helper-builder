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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_1 = __importDefault(require("handlebars"));
const Services_1 = require("./Services");
const path = require('path');
const cors = require('cors');
const express = require('express');
const getFunctionArgs = require('get-function-args-x').default;
class Server extends Services_1.Services {
    constructor(config) {
        super(config);
        this.helperOptions = [];
        this.exampleText = 'exampleText';
        const { port } = config;
        this.port = port;
    }
    // @override
    registerHelper(name, helper, options) {
        handlebars_1.default.registerHelper(name, helper);
        let argsDefinition = {};
        let description = 'Description does not available';
        if (options === null || options === void 0 ? void 0 : options.description)
            description = options.description;
        if (options === null || options === void 0 ? void 0 : options.argsDefinition)
            argsDefinition = options.argsDefinition;
        this.helperOptions.push({ helperName: name, description, argsDefinition });
    }
    // @override
    getHelpers() {
        return Object.keys(handlebars_1.default.helpers).filter(helper => {
            return /^custom.*$/gi.test(helper);
        }).sort().map(helper => {
            const helperFcn = handlebars_1.default.helpers[helper];
            const params = getFunctionArgs(helperFcn).map((param) => {
                const params = param.split('=');
                let helperParam = params[1] ? params[1] : params[0];
                return helperParam.replace(/["'`]/g, '').trim();
            });
            return {
                name: helper,
                helper: helperFcn,
                description: this.getHelperOptions(helper).description,
                argsDefinition: this.getHelperOptions(helper).argsDefinition,
                func: helperFcn.toString(),
                params: params,
                usage: `{{{ ${helper} ${params.map((p) => `"${p}"`).join(' ')} }}}`,
            };
        });
    }
    getHelperOptions(helper) {
        let description = this.helperOptions.filter(desc => desc.helperName === helper);
        return description.pop();
    }
    buildHelperBlock(name, params) {
        return `<div data-helper="${name}">{{{${name} ${params.join(' ')}}}}</div>`;
    }
    getGelpersBlock() {
        return this.getHelpers().map(helper => {
            return this.buildHelperBlock(helper.name, helper.params);
        }).join('');
    }
    getGelperBlock(helperName) {
        return this.getHelpers().filter(h => h.name === helperName).map(helper => {
            return this.buildHelperBlock(helper.name, helper.params);
        }).join('');
    }
    responseTemplate(res, template, doc) {
        res.render('index.html', {
            template: template,
            doc: JSON.stringify(doc),
            port: this.port,
            docId: this.defaultDocId,
            helpers: JSON.stringify(this.getHelpers().map(helper => {
                const func = helper.helper.toString();
                const usage = `{{{ ${helper.name} ${helper.params.map((p) => `"${p}"`).join(' ')} }}}`;
                return Object.assign(helper, { func, usage });
            })),
        });
    }
    getCompile(doc, template) {
        return handlebars_1.default.compile(handlebars_1.default.compile(template)({}))(doc);
    }
    setReloadAddPage(val) {
        this.isReloadAdllPage = val;
    }
    start() {
        let reload = true;
        const app = express();
        const server = require('http').Server(app);
        const io = require('socket.io')(server);
        app.set('views', __dirname);
        app.engine('html', require('ejs').renderFile);
        app.use(cors());
        app.use(express.static(path.join(__dirname, 'app')));
        io.on('connection', (socket) => {
            if (reload)
                socket.emit(this.isReloadAdllPage ? 'reload-all' : 'reload');
            reload = false;
        });
        app.get('/doc/json', (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const doc = yield this.getDocument();
                doc === null || doc === void 0 ? true : delete doc.layout;
                doc === null || doc === void 0 ? true : delete doc.content;
                res.json(doc);
            }
            catch (err) {
                res.status(400).send(err);
            }
        }));
        app.get('/helpers', (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.json(yield this.getHelpers());
            }
            catch (err) {
                res.status(400).send(err);
            }
        }));
        app.get('/helper/:helper', (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let template = yield this.getTemplate();
                const doc = yield this.getDocument();
                const helper = (_a = _req === null || _req === void 0 ? void 0 : _req.params) === null || _a === void 0 ? void 0 : _a.helper;
                doc === null || doc === void 0 ? true : delete doc.layout;
                doc === null || doc === void 0 ? true : delete doc.content;
                const replace = `
          <div class="nf-html-editor">
            <div class="trumbowyg-editor viewer">${this.getGelperBlock(helper)}</div>
        `;
                template = template.replace(/<div class="nf-html-editor">/gi, replace);
                template = this.getCompile(doc, template);
                this.responseTemplate(res, template, doc);
            }
            catch (err) {
                console.log(err);
                this.responseTemplate(res, err, {});
            }
        }));
        app.get('/', (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('app/index.html', {});
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
            }
            catch (err) {
                console.log(err);
                res.status(500).send(err);
                // this.responseTemplate(res, err, {})
            }
        }));
        server.listen(this.port, () => {
            console.log('server started at http://localhost:' + this.port);
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map