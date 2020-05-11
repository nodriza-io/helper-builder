<script>
	import { onMount } from 'svelte'
	import RefreshIcon from './components/RefreshIcon.svelte'
	import WorldIcon from './components/WorldIcon.svelte'
	import TagHtmlIcon from './components/TagHtmlIcon.svelte'
	import render from './modules/render.js'
	import editor from './modules/editor.js'
	
	const lsLangKey = 'helper-editor-language'
	const lsIdKey = 'helper-editor-rootId'
	const lsDocKey = 'helper-editor-document'
	const lsCodeKey = 'helper-editor-code'
	
	var ifrSrc = ''
	let editorHandler
	let lang = window.localStorage.getItem(lsLangKey) || 'javascript'
	let rootId = window.localStorage.getItem(lsIdKey)
	let docUrl = window.localStorage.getItem(lsDocKey)

	function setLanguage (_lang) {
		lang = _lang
		window.localStorage.setItem(lsLangKey, _lang)
		editorHandler.getSession().setOption('mode', `ace/mode/${_lang}`)
	}

	onMount(async function () {
		if (/https/g.test(docUrl)) await refresh(docUrl, rootId)
		const initialCode = window.localStorage.getItem(lsCodeKey) || ''
		editorHandler = editor({ render, lang, lsCodeKey, rootId, docUrl, initialCode })
	})

	async function setKeys (url, rootId) {
		await refresh (url, rootId)
		window.location.reload()
	}

	async function refresh (url, rootId) {
		window.localStorage.setItem(lsDocKey, url)
		window.localStorage.setItem(lsIdKey, rootId)
		ifrSrc = await render(url, rootId)
		return
	}
</script>


<main>
	<section>
		<div class="container-fluid">

			<!-- NAV BAR -->
			<div class="row">
		    <div class="col-12 pl-0 pr-0">
		    	<nav class="navbar navbar-expand-lg navbar-light bg-light">
					  <a class="navbar-brand" href="javascript:void(0)">
					  	<img src="/images/icon.png" width="30" height="30" alt="">
					  </a>
					  <div class="collapse navbar-collapse" id="navbarSupportedContent">
					    <ul class="navbar-nav mr-auto">
					      <li class="nav-item dropdown">
					        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					          Language ({ lang })
					        </a>
					        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
					          <a class="dropdown-item" href="#" on:click="{ () => setLanguage('html') }">HTML</a>
					          <a class="dropdown-item" href="#" on:click="{ () => setLanguage('javascript') }">Javascript</a>
					        </div>
					      </li>
					    </ul>
					    <button id="btn-cancel" class="btn btn-danger my-2 my-sm-0" type="button">
					    	Cancel
					    </button>
					    &nbsp;
					    &nbsp;
					    <button id="btn-ok" class="btn btn-primary my-2 my-sm-0" type="button">
					    	Ok
					    </button>
					  </div>
					</nav>
		    </div>
			</div>

			<!-- INPUT SETUP -->
			<div class="row">
				<div class="col-6 pl-0 pr-0">
		      <div class="input-group mb-1 mt-0">
		        <div class="input-group-prepend">
		          <div class="input-group-text">
		          	<WorldIcon/>
		          </div>
		        </div>
		        <input 
		       		bind:value={docUrl} 
		       		on:change={() => setKeys(docUrl, rootId)} 
		       		type="text" 
		       		placeholder="Proposal demo URL (example: https://dev.nodriza.io/v1/document/proposal/5eb47961310ff80cc262dcd1/full?source=none&rand=1134772)" 
		       		class="form-control">
		      </div>
				</div>
				<div class="col-6 pl-0 pr-0">
		    	<div class="input-group mb-1 mt-0">
		        <div class="input-group-prepend">
		          <div class="input-group-text">
		          	<TagHtmlIcon/>
		          </div>
		        </div>
		        <input 
		        	bind:value={rootId} 
		        	on:change={() => setKeys(docUrl, rootId)} 
		        	type="text" 
		        	placeholder="Main content ID (example: content-hotelalmirante)" 
		        	class="form-control">
		      </div>
				</div>
			</div>
			
			<!-- EDITOR AND VIEWER -->
		  <div class="row">
		    <div class="col-6 pl-1 pr-0">
		      <div id="editor"></div>
		    </div>
		    <div class="col-6 pl-1 pr-0">
		    	<iframe id="viewer" src="{ifrSrc}" frameborder="0"></iframe>
		    </div>
		  </div>
		</div>
	</section>
</main>


<style>
	main {
		position: fixed;
		overflow: hidden;
		width: 100%;
		height: 100%;
		background: black;
	}
	input, .input-group-text {
		border-radius: 0;
	}
	iframe {
		width: 100%;
		height: calc(100vh - 80px);
	}
	#editor { 
    position: absolute;
    top: 0px;
    right: 0;
    bottom: 0;
    left: 0;
    height: calc(100vh - 100px);
  }
</style>











