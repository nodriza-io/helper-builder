var doc = JSON.parse(document.currentScript.getAttribute('doc'))
var envDocId = document.currentScript.getAttribute('docid')
var port = document.currentScript.getAttribute('port')
var socket = io('http://localhost:' + port)
var url = new URL(window.location.href)
var docId = document.getElementById('docId').value
var model = document.getElementById('model').value
var urlDocId = url.searchParams.get('docId')
var urlModel = url.searchParams.get('model')
var jsonWidth = $('#json-renderer').width()

socket.on('reload', function () {
  fetch(window.location.href).then(response => response.text()).then(html => {
    var selector = 'div#grid #viewer .trumbowyg-editor.viewer'
    $(selector).empty()
    var parser = new DOMParser()
    var doc = parser.parseFromString(html, 'text/html')
    $(selector).append(doc.querySelector(selector).innerHTML)
  })
})

if (urlDocId) {
  document.getElementById('docId').value = urlDocId
}

if (!urlDocId && !urlModel) {
  url.searchParams.append('model', urlModel || model)
  url.searchParams.append('docId', urlDocId || docId)
  console.log(url.href)
  window.location.href = url.href
}

document.getElementById('docId').addEventListener('change', function (event) {
  var url = new URL(window.location.href)
  value = event.target.value
  if (value) {
    url.searchParams.set('docId', value)
    window.location.href = url.href
  } 
})

$('#json-renderer').resizable({
  animate: true,
}).scroll(function (event) {
  setHashOption('jsonScrollTop', $(event.target).scrollTop())
}).jsonViewer(doc)

resizeSensor.create(document.getElementById('json-renderer'), function (event) {
  setHashOption('jsonWidth', event.width)
})

function restoreViewer (data) {
  if (!data) return
  if (data.jsonWidth) $('#json-renderer').width(data.jsonWidth)
  if (data.jsonScrollTop) $('#json-renderer').scrollTop(data.jsonScrollTop)
}

function setHashOption (attribute, value) {
  var hash = getParamsHash(new URL(window.location).hash)
  if (!hash) hash = {}
  hash[attribute] = value
  window.location.hash = encodeURIComponent(JSON.stringify(hash))
}

function getParamsHash (_hash) {
  try {
    var hash = _hash.replace(/#/g, '')
    if (!hash) return null
    hash = decodeURIComponent(hash)
    hash = JSON.parse(hash)
    return hash
  } catch (err) {
    console.log(err)
    return null
  }
}

restoreViewer(getParamsHash(url.hash))

if (envDocId && !urlDocId) {
  url.searchParams.set('docId', envDocId)
  window.location.href = url.href
}
