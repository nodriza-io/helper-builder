const Server = require('./server');
const server = new Server({
    apiKey: process.env.API_KEY || '',
    account: process.env.ACCOUNT || '',
    port: process.env.PORT || '3000',
    model: process.env.PORT || 'proposal',
    defaultDocId: process.env.DOC_ID || ''
});
server.start();
//# sourceMappingURL=index.js.map