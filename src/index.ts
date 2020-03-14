require('dotenv').config()
const Server = require('./server').Server

const server = new Server({ 
  apiKey: process.env.API_KEY || '', 
  account: process.env.ACCOUNT || '', 
  port: process.env.PORT || '3000', 
  model: process.env.PORT || 'proposal', 
  defaultDocId: process.env.DOC_ID || '' 
})

server.start()
