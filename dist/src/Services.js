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
const Nodriza = require('nodriza');
const axios = require('axios');
class Services {
    constructor(config) {
        this.account = config.account;
        this.model = config.model;
        this.apiKey = config.apiKey;
        this.defaultDocId = config.defaultDocId;
        if (this.account)
            this.account += '.nodriza.io';
        this.Sdk = new Nodriza({ hostname: this.account, accessToken: config.apiKey });
    }
    getTemplate() {
        return new Promise((resolve, reject) => {
            const url = `https://${this.account}/v1/document/${this.model}/${this.defaultDocId}/html?source=none&rand=${new Date().getTime()}`;
            axios(url).then((response) => {
                resolve(response.data);
            }).catch((err) => {
                reject(err.toString());
            });
        });
    }
    findHelper(keyname) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            (_b = (_a = this.Sdk.api) === null || _a === void 0 ? void 0 : _a.helperBuilder) === null || _b === void 0 ? void 0 : _b.findOne(keyname, (err, doc) => {
                if (err)
                    return resolve({});
                resolve(doc);
            });
        });
    }
    createHelper(helper) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            (_b = (_a = this.Sdk.api) === null || _a === void 0 ? void 0 : _a.helperBuilder) === null || _b === void 0 ? void 0 : _b.create(helper, (err, doc) => {
                if (err)
                    return reject(err);
                resolve(doc);
            });
        });
    }
    updateHelper(keyname, helper) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            (_b = (_a = this.Sdk.api) === null || _a === void 0 ? void 0 : _a.helperBuilder) === null || _b === void 0 ? void 0 : _b.update(keyname, helper, (err, doc) => {
                if (err)
                    return reject(err);
                resolve(doc);
            });
        });
    }
    exportHelper(helper) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = {
                    type: 'proposal',
                    keyname: helper.name,
                    helper: helper.func,
                    usage: helper.usage,
                };
                const doc = yield this.findHelper(helper.name);
                if (doc === null || doc === void 0 ? void 0 : doc.id)
                    return resolve({ updated: yield this.updateHelper(doc.keyname, payload) });
                resolve({ created: yield this.createHelper(payload) });
            }
            catch (err) {
                resolve(err);
            }
        }));
    }
    exportHelpers(helpers) {
        return Promise.all(helpers.map(helper => this.exportHelper(helper)));
    }
    getDocument() {
        return new Promise((resolve, reject) => {
            var _a;
            (_a = this.Sdk.api[this.model]) === null || _a === void 0 ? void 0 : _a.findOne(this.defaultDocId, (err, doc) => {
                if (err)
                    return reject(err);
                resolve(doc);
            });
        });
    }
}
exports.Services = Services;
//# sourceMappingURL=Services.js.map