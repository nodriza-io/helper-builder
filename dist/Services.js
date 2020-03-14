"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Nodriza = require('nodriza');
const axios = require('axios');
class Services {
    constructor(config) {
        this.account = config.account;
        this.model = config.model;
        this.defaultDocId = config.defaultDocId;
        this.Sdk = new Nodriza({ hostname: this.account, accessToken: config.apiKey });
    }
    getTemplate() {
        return new Promise((resolve, reject) => {
            const url = `https://${this.account}/v1/document/${this.model}/${this.defaultDocId}/html?source=none&rand=${new Date().getTime()}`;
            axios(url).then((response) => {
                resolve(response.data);
            }).catch((err) => {
                reject(err.response.data);
            });
        });
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