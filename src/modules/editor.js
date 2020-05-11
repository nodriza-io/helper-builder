export default function (config) {
  const { render, lsCodeKey, lang, rootId, docUrl, initialCode } = config
  
  var interval
  
  ace.config.set('basePath', '')
  ace.config.set('modePath', '')
  ace.config.set('themePath', '')

  const editor = ace.default.edit('editor')

  window.w = editor

  editor.setTheme('ace/theme/monokai')

  editor.session.setOptions({
    tabSize: 2,
    useSoftTabs: true,
    mode: 'ace/mode/' + lang,
    enableLiveAutoComplete: true,
  })  

  editor.setOption('enableEmmet', true)

  editor.on('change', () => {
    const value = editor.getValue()
    window.localStorage.setItem(lsCodeKey, value)
    clearTimeout(interval)
    interval = setTimeout(async function () {
      let iframe = document.getElementById('viewer')
      iframe = iframe.contentDocument.querySelector(`.trumbowyg-editor.active #${ rootId }`)
      const html =  await render(docUrl, rootId, value, true)
      if (html) {
        const parent = iframe.parentElement
        const oldChild = iframe
        const newChild = html.getElementById(rootId)
        parent.replaceChild(newChild, oldChild)
      }
      clearInterval(interval)
    }, 1000)
  })

  if (initialCode) editor.setValue(initialCode)  

  return editor
}