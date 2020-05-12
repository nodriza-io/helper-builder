import { sumProducts } from './suportFunctions.js'

function showError (err) {
  console.error('[Helper Builder]', err)
} 

function buildContent (doc, rootId) {
  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          ${doc.head.innerHTML}
          <style>
            .trumbowyg-editor #${rootId}, .lds-spinner, #modal {
              display: none !important;
            }
            .trumbowyg-editor.active #${rootId} {
              display: block !important; 
            }
          </style>
          <script>
            if (!window.$) window.$ = {}
            if (!window.io) window.io = {}
            if (!window.jQuery) window.JQuery = {}
          </script>
        </head>
        <body>
          ${doc.body.innerHTML}
        </body>
      </html>
    `
}

function buildHelper (rootId, helperName, helperFnc) {
  let args = /^\w.+\(\w+=["|'](.*)(?=["|'])/gm.exec(helperFnc)
  args = args && args[1] ? args[1] : ''
  const helper = `
      <div id="${rootId}">
        {{{ ${helperName} ${args} }}}
      </div>
    `
  return helper
}

function evalhelper (helperFnc) {
  try {
    if (!helperFnc) return Function
    const code = '(() => ' + helperFnc + ')(); ' + sumProducts.toString()
    return eval(code)
  } catch (err) {
    showError(err)
  }
}

const render = async function (url, rootId, helperFnc, isHtml) {
  try {
    if (!url || !rootId) return
    if (!/serverender/i.test(url)) {
      url += '&serverender=true'
    }

    const helperName = 'helperBuilder'
    const dataUrl = url.replace('full', 'json')

    let html = window.htmlCache || await fetch(url).then(r => r.text())
    html = html.replace(/src="\/\/s3/gm, 'src="https://s3')
    const data = window.dataCache || await fetch(dataUrl).then(r => r.json())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const helper = doc.createElement('div')

    window.dataCache = data
    window.htmlCache = html

    if (helperFnc) {
      try {
        const code = evalhelper(helperFnc)
        delete Handlebars.helpers[helperName]
        Handlebars.registerHelper(helperName, code)
      } catch (err) {
        showError(err)
      }
    }

    helper.className = 'trumbowyg-editor active'
    helper.innerHTML = buildHelper(rootId, helperName, helperFnc)

    doc.querySelector('.v-header--container').style.display = 'block'
    doc
      .getElementById(rootId)
      .parentElement
      .parentElement
      .insertBefore(helper, doc.getElementById(rootId).parentElement)

    const newHtml = buildContent(doc, rootId)
    const template = Handlebars.compile(newHtml)
    const result = template(data)

    if (isHtml) {
      const newHtmlParse = new DOMParser().parseFromString(result, 'text/html')
      return newHtmlParse
    } 

    const blob = new Blob([result], { type: 'text/html' })
    const src = URL.createObjectURL(blob)
   
    return src //+= '#zoom=100'
  } catch (err) {
    showError(err)
  }
}

export default render
