require('dotenv').config()

const { Builder } = require('../dist/index')

const builder = new Builder({
  account: process.env.ACCOUNT,
  apiKey: process.env.API_KEY,
  defaultDocId: process.env.DOC_ID,
})

builder.registerHelper('customHelper', function () {
  return `Proposal <strong>{{this.title}}</strong>`
})

builder.registerHelper('customHelperBasic', function (options = `name="Aldair Quinatana"`) {
  return `Hola <strong>${options.hash.name}</strong>`
})

builder.registerHelper('customHelperAdvance', function (options='productos=this.products name=this.title creator="Wilmar Ibarguen"') {
  let cant = options.hash.productos.length
  let name = options.hash.name
  let creator = options.hash.creator
  return `
    The proposal name is <b>"${name}"</b> 
    <br>Contains <b>${cant}</b> products 
    <br>Created by <b>${creator}</b>
  `
})

builder.serverStart()
