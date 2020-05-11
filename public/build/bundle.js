
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/RefreshIcon.svelte generated by Svelte v3.22.2 */

    const file = "src/components/RefreshIcon.svelte";

    function create_fragment(ctx) {
    	let symbol;
    	let path;
    	let t;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			symbol = svg_element("symbol");
    			path = svg_element("path");
    			t = space();
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(path, "d", "M32 12h-12l4.485-4.485c-2.267-2.266-5.28-3.515-8.485-3.515s-6.219 1.248-8.485 3.515c-2.266 2.267-3.515 5.28-3.515 8.485s1.248 6.219 3.515 8.485c2.267 2.266 5.28 3.515 8.485 3.515s6.219-1.248 8.485-3.515c0.189-0.189 0.371-0.384 0.546-0.583l3.010 2.634c-2.933 3.349-7.239 5.464-12.041 5.464-8.837 0-16-7.163-16-16s7.163-16 16-16c4.418 0 8.418 1.791 11.313 4.687l4.687-4.687v12z");
    			add_location(path, file, 1, 0, 49);
    			attr_dev(symbol, "id", "icon-spinner11");
    			attr_dev(symbol, "viewBox", "0 0 32 32");
    			add_location(symbol, file, 0, 0, 0);
    			xlink_attr(use, "xlink:href", "#icon-spinner11");
    			add_location(use, file, 4, 33, 487);
    			attr_dev(svg, "class", "icon icon-spinner11 svelte-10r85o2");
    			add_location(svg, file, 4, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, symbol, anchor);
    			append_dev(symbol, path);
    			insert_dev(target, t, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(symbol);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RefreshIcon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RefreshIcon", $$slots, []);
    	return [];
    }

    class RefreshIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RefreshIcon",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/WorldIcon.svelte generated by Svelte v3.22.2 */

    const file$1 = "src/components/WorldIcon.svelte";

    function create_fragment$1(ctx) {
    	let symbol;
    	let path;
    	let t;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			symbol = svg_element("symbol");
    			path = svg_element("path");
    			t = space();
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(path, "d", "M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 30c-1.967 0-3.84-0.407-5.538-1.139l7.286-8.197c0.163-0.183 0.253-0.419 0.253-0.664v-3c0-0.552-0.448-1-1-1-3.531 0-7.256-3.671-7.293-3.707-0.188-0.188-0.442-0.293-0.707-0.293h-4c-0.552 0-1 0.448-1 1v6c0 0.379 0.214 0.725 0.553 0.894l3.447 1.724v5.871c-3.627-2.53-6-6.732-6-11.489 0-2.147 0.484-4.181 1.348-6h3.652c0.265 0 0.52-0.105 0.707-0.293l4-4c0.188-0.188 0.293-0.442 0.293-0.707v-2.419c1.268-0.377 2.61-0.581 4-0.581 2.2 0 4.281 0.508 6.134 1.412-0.13 0.109-0.256 0.224-0.376 0.345-1.133 1.133-1.757 2.64-1.757 4.243s0.624 3.109 1.757 4.243c1.139 1.139 2.663 1.758 4.239 1.758 0.099 0 0.198-0.002 0.297-0.007 0.432 1.619 1.211 5.833-0.263 11.635-0.014 0.055-0.022 0.109-0.026 0.163-2.541 2.596-6.084 4.208-10.004 4.208z");
    			add_location(path, file$1, 1, 0, 45);
    			attr_dev(symbol, "id", "icon-earth");
    			attr_dev(symbol, "viewBox", "0 0 32 32");
    			add_location(symbol, file$1, 0, 0, 0);
    			xlink_attr(use, "xlink:href", "#icon-earth");
    			add_location(use, file$1, 4, 29, 907);
    			attr_dev(svg, "class", "icon icon-earth svelte-10r85o2");
    			add_location(svg, file$1, 4, 0, 878);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, symbol, anchor);
    			append_dev(symbol, path);
    			insert_dev(target, t, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(symbol);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WorldIcon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("WorldIcon", $$slots, []);
    	return [];
    }

    class WorldIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WorldIcon",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/TagHtmlIcon.svelte generated by Svelte v3.22.2 */

    const file$2 = "src/components/TagHtmlIcon.svelte";

    function create_fragment$2(ctx) {
    	let symbol;
    	let path0;
    	let path1;
    	let path2;
    	let t;
    	let svg;
    	let use;

    	const block = {
    		c: function create() {
    			symbol = svg_element("symbol");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t = space();
    			svg = svg_element("svg");
    			use = svg_element("use");
    			attr_dev(path0, "d", "M26 23l3 3 10-10-10-10-3 3 7 7z");
    			add_location(path0, file$2, 1, 0, 46);
    			attr_dev(path1, "d", "M14 9l-3-3-10 10 10 10 3-3-7-7z");
    			add_location(path1, file$2, 2, 0, 96);
    			attr_dev(path2, "d", "M21.916 4.704l2.171 0.592-6 22.001-2.171-0.592 6-22.001z");
    			add_location(path2, file$2, 3, 0, 146);
    			attr_dev(symbol, "id", "icon-embed2");
    			attr_dev(symbol, "viewBox", "0 0 40 32");
    			add_location(symbol, file$2, 0, 0, 0);
    			xlink_attr(use, "xlink:href", "#icon-embed2");
    			add_location(use, file$2, 6, 30, 262);
    			attr_dev(svg, "class", "icon icon-embed2 svelte-1n5amea");
    			add_location(svg, file$2, 6, 0, 232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, symbol, anchor);
    			append_dev(symbol, path0);
    			append_dev(symbol, path1);
    			append_dev(symbol, path2);
    			insert_dev(target, t, anchor);
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(symbol);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TagHtmlIcon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TagHtmlIcon", $$slots, []);
    	return [];
    }

    class TagHtmlIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagHtmlIcon",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function showError (err) {
      console.error('[Helper Builder]', err);
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
      let args = /^\w.+\(\w+=["|'](.*)(?=["|'])/gm.exec(helperFnc);
      args = args && args[1] ? args[1] : '';
      const helper = `
      <div id="${rootId}">
        {{{ ${helperName} ${args} }}}
      </div>
    `;
      return helper
    }

    function evalhelper (helperFnc) {
      try {
        if (!helperFnc) return Function
        const code = '(() => ' + helperFnc + ')()';
        return eval(code)
      } catch (err) {
        showError(err);
      }
    }

    const render = async function (url, rootId, helperFnc, isHtml) {
      try {
        if (!url || !rootId) return
        if (!/serverender/i.test(url)) {
          url += '&serverender=true';
        }

        const helperName = 'helperBuilder';
        const dataUrl = url.replace('full', 'json');

        let html = window.htmlCache || await fetch(url).then(r => r.text());
        html = html.replace(/src="\/\/s3/gm, 'src="https://s3');
        const data = window.dataCache || await fetch(dataUrl).then(r => r.json());
        const doc = new DOMParser().parseFromString(html, "text/html");
        const helper = doc.createElement('div');

        window.dataCache = data;
        window.htmlCache = html;

        if (helperFnc) {
          try {
            const code = evalhelper(helperFnc);
            delete Handlebars.helpers[helperName];
            Handlebars.registerHelper(helperName, code);
          } catch (err) {
            showError(err);
          }
        }

        helper.className = 'trumbowyg-editor active';
        helper.innerHTML = buildHelper(rootId, helperName, helperFnc);

        doc.querySelector('.v-header--container').style.display = 'block';
        doc
          .getElementById(rootId)
          .parentElement
          .parentElement
          .insertBefore(helper, doc.getElementById(rootId).parentElement);

        const newHtml = buildContent(doc, rootId);
        const template = Handlebars.compile(newHtml);
        const result = template(data);

        if (isHtml) {
          const newHtmlParse = new DOMParser().parseFromString(result, 'text/html');
          return newHtmlParse
        } 

        const blob = new Blob([result], { type: 'text/html' });
        const src = URL.createObjectURL(blob);
       
        return src //+= '#zoom=100'
      } catch (err) {
        showError(err);
      }
    };

    function editor (config) {
      const { render, lsCodeKey, lang, rootId, docUrl, initialCode } = config;
      
      var interval;
      
      ace.config.set('basePath', '');
      ace.config.set('modePath', '');
      ace.config.set('themePath', '');

      const editor = ace.default.edit('editor');

      window.w = editor;

      editor.setTheme('ace/theme/monokai');

      editor.session.setOptions({
        tabSize: 2,
        useSoftTabs: true,
        mode: 'ace/mode/' + lang,
        enableLiveAutoComplete: true,
      });  

      editor.setOption('enableEmmet', true);

      editor.on('change', () => {
        const value = editor.getValue();
        window.localStorage.setItem(lsCodeKey, value);
        clearTimeout(interval);
        interval = setTimeout(async function () {
          let iframe = document.getElementById('viewer');
          iframe = iframe.contentDocument.querySelector(`.trumbowyg-editor.active #${ rootId }`);
          const html =  await render(docUrl, rootId, value, true);
          if (html) {
            const parent = iframe.parentElement;
            const oldChild = iframe;
            const newChild = html.getElementById(rootId);
            parent.replaceChild(newChild, oldChild);
          }
          clearInterval(interval);
        }, 1000);
      });

      if (initialCode) editor.setValue(initialCode);  

      return editor
    }

    /* src/App.svelte generated by Svelte v3.22.2 */
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let section;
    	let div17;
    	let div3;
    	let div2;
    	let nav;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let ul;
    	let li;
    	let a1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div0;
    	let a2;
    	let t6;
    	let a3;
    	let t8;
    	let button0;
    	let t10;
    	let button1;
    	let t12;
    	let div12;
    	let div7;
    	let div6;
    	let div5;
    	let div4;
    	let t13;
    	let input0;
    	let t14;
    	let div11;
    	let div10;
    	let div9;
    	let div8;
    	let t15;
    	let input1;
    	let t16;
    	let div16;
    	let div14;
    	let div13;
    	let t17;
    	let div15;
    	let iframe;
    	let iframe_src_value;
    	let current;
    	let dispose;
    	const worldicon = new WorldIcon({ $$inline: true });
    	const taghtmlicon = new TagHtmlIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			div17 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li = element("li");
    			a1 = element("a");
    			t1 = text("Language (");
    			t2 = text(/*lang*/ ctx[1]);
    			t3 = text(")");
    			t4 = space();
    			div0 = element("div");
    			a2 = element("a");
    			a2.textContent = "HTML";
    			t6 = space();
    			a3 = element("a");
    			a3.textContent = "Javascript";
    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t10 = text("\n\t\t\t\t\t     \n\t\t\t\t\t     \n\t\t\t\t\t    ");
    			button1 = element("button");
    			button1.textContent = "Ok";
    			t12 = space();
    			div12 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			create_component(worldicon.$$.fragment);
    			t13 = space();
    			input0 = element("input");
    			t14 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			create_component(taghtmlicon.$$.fragment);
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			div16 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			t17 = space();
    			div15 = element("div");
    			iframe = element("iframe");
    			if (img.src !== (img_src_value = "/images/icon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "30");
    			attr_dev(img, "height", "30");
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 54, 8, 1644);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "javascript:void(0)");
    			add_location(a0, file$3, 53, 7, 1585);
    			attr_dev(a1, "class", "nav-link dropdown-toggle");
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "id", "navbarDropdown");
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "data-toggle", "dropdown");
    			attr_dev(a1, "aria-haspopup", "true");
    			attr_dev(a1, "aria-expanded", "false");
    			add_location(a1, file$3, 59, 13, 1885);
    			attr_dev(a2, "class", "dropdown-item");
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$3, 63, 15, 2173);
    			attr_dev(a3, "class", "dropdown-item");
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$3, 64, 15, 2272);
    			attr_dev(div0, "class", "dropdown-menu");
    			attr_dev(div0, "aria-labelledby", "navbarDropdown");
    			add_location(div0, file$3, 62, 13, 2097);
    			attr_dev(li, "class", "nav-item dropdown");
    			add_location(li, file$3, 58, 11, 1841);
    			attr_dev(ul, "class", "navbar-nav mr-auto");
    			add_location(ul, file$3, 57, 9, 1798);
    			attr_dev(button0, "id", "btn-cancel");
    			attr_dev(button0, "class", "btn btn-danger my-2 my-sm-0");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$3, 68, 9, 2429);
    			attr_dev(button1, "id", "btn-ok");
    			attr_dev(button1, "class", "btn btn-primary my-2 my-sm-0");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$3, 73, 9, 2581);
    			attr_dev(div1, "class", "collapse navbar-collapse");
    			attr_dev(div1, "id", "navbarSupportedContent");
    			add_location(div1, file$3, 56, 7, 1722);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light bg-light");
    			add_location(nav, file$3, 52, 7, 1518);
    			attr_dev(div2, "class", "col-12 pl-0 pr-0");
    			add_location(div2, file$3, 51, 6, 1480);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$3, 50, 3, 1456);
    			attr_dev(div4, "class", "input-group-text svelte-1t9mmbd");
    			add_location(div4, file$3, 86, 12, 2914);
    			attr_dev(div5, "class", "input-group-prepend");
    			add_location(div5, file$3, 85, 10, 2868);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Proposal demo URL (example: https://dev.nodriza.io/v1/document/proposal/5eb47961310ff80cc262dcd1/full?source=none&rand=1134772)");
    			attr_dev(input0, "class", "form-control svelte-1t9mmbd");
    			add_location(input0, file$3, 90, 10, 3017);
    			attr_dev(div6, "class", "input-group mb-1 mt-0");
    			add_location(div6, file$3, 84, 8, 2822);
    			attr_dev(div7, "class", "col-6 pl-0 pr-0");
    			add_location(div7, file$3, 83, 4, 2784);
    			attr_dev(div8, "class", "input-group-text svelte-1t9mmbd");
    			add_location(div8, file$3, 101, 12, 3481);
    			attr_dev(div9, "class", "input-group-prepend");
    			add_location(div9, file$3, 100, 10, 3435);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Main content ID (example: content-hotelalmirante)");
    			attr_dev(input1, "class", "form-control svelte-1t9mmbd");
    			add_location(input1, file$3, 105, 10, 3586);
    			attr_dev(div10, "class", "input-group mb-1 mt-0");
    			add_location(div10, file$3, 99, 7, 3389);
    			attr_dev(div11, "class", "col-6 pl-0 pr-0");
    			add_location(div11, file$3, 98, 4, 3352);
    			attr_dev(div12, "class", "row");
    			add_location(div12, file$3, 82, 3, 2762);
    			attr_dev(div13, "id", "editor");
    			attr_dev(div13, "class", "svelte-1t9mmbd");
    			add_location(div13, file$3, 118, 8, 3949);
    			attr_dev(div14, "class", "col-6 pl-1 pr-0");
    			add_location(div14, file$3, 117, 6, 3911);
    			attr_dev(iframe, "id", "viewer");
    			if (iframe.src !== (iframe_src_value = /*ifrSrc*/ ctx[0])) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "class", "svelte-1t9mmbd");
    			add_location(iframe, file$3, 121, 7, 4029);
    			attr_dev(div15, "class", "col-6 pl-1 pr-0");
    			add_location(div15, file$3, 120, 6, 3992);
    			attr_dev(div16, "class", "row");
    			add_location(div16, file$3, 116, 4, 3887);
    			attr_dev(div17, "class", "container-fluid");
    			add_location(div17, file$3, 47, 2, 1402);
    			add_location(section, file$3, 46, 1, 1390);
    			attr_dev(main, "class", "svelte-1t9mmbd");
    			add_location(main, file$3, 45, 0, 1382);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, div17);
    			append_dev(div17, div3);
    			append_dev(div3, div2);
    			append_dev(div2, nav);
    			append_dev(nav, a0);
    			append_dev(a0, img);
    			append_dev(nav, t0);
    			append_dev(nav, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li);
    			append_dev(li, a1);
    			append_dev(a1, t1);
    			append_dev(a1, t2);
    			append_dev(a1, t3);
    			append_dev(li, t4);
    			append_dev(li, div0);
    			append_dev(div0, a2);
    			append_dev(div0, t6);
    			append_dev(div0, a3);
    			append_dev(div1, t8);
    			append_dev(div1, button0);
    			append_dev(div1, t10);
    			append_dev(div1, button1);
    			append_dev(div17, t12);
    			append_dev(div17, div12);
    			append_dev(div12, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			mount_component(worldicon, div4, null);
    			append_dev(div6, t13);
    			append_dev(div6, input0);
    			set_input_value(input0, /*docUrl*/ ctx[3]);
    			append_dev(div12, t14);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			mount_component(taghtmlicon, div8, null);
    			append_dev(div10, t15);
    			append_dev(div10, input1);
    			set_input_value(input1, /*rootId*/ ctx[2]);
    			append_dev(div17, t16);
    			append_dev(div17, div16);
    			append_dev(div16, div14);
    			append_dev(div14, div13);
    			append_dev(div16, t17);
    			append_dev(div16, div15);
    			append_dev(div15, iframe);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(a2, "click", /*click_handler*/ ctx[8], false, false, false),
    				listen_dev(a3, "click", /*click_handler_1*/ ctx[9], false, false, false),
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    				listen_dev(input0, "change", /*change_handler*/ ctx[11], false, false, false),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    				listen_dev(input1, "change", /*change_handler_1*/ ctx[13], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*lang*/ 2) set_data_dev(t2, /*lang*/ ctx[1]);

    			if (dirty & /*docUrl*/ 8 && input0.value !== /*docUrl*/ ctx[3]) {
    				set_input_value(input0, /*docUrl*/ ctx[3]);
    			}

    			if (dirty & /*rootId*/ 4 && input1.value !== /*rootId*/ ctx[2]) {
    				set_input_value(input1, /*rootId*/ ctx[2]);
    			}

    			if (!current || dirty & /*ifrSrc*/ 1 && iframe.src !== (iframe_src_value = /*ifrSrc*/ ctx[0])) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(worldicon.$$.fragment, local);
    			transition_in(taghtmlicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(worldicon.$$.fragment, local);
    			transition_out(taghtmlicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(worldicon);
    			destroy_component(taghtmlicon);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const lsLangKey = "helper-editor-language";
    const lsIdKey = "helper-editor-rootId";
    const lsDocKey = "helper-editor-document";
    const lsCodeKey = "helper-editor-code";

    function instance$3($$self, $$props, $$invalidate) {
    	var ifrSrc = "";
    	let editorHandler;
    	let lang = window.localStorage.getItem(lsLangKey) || "javascript";
    	let rootId = window.localStorage.getItem(lsIdKey);
    	let docUrl = window.localStorage.getItem(lsDocKey);

    	function setLanguage(_lang) {
    		$$invalidate(1, lang = _lang);
    		window.localStorage.setItem(lsLangKey, _lang);
    		editorHandler.getSession().setOption("mode", `ace/mode/${_lang}`);
    	}

    	onMount(async function () {
    		if ((/https/g).test(docUrl)) await refresh(docUrl, rootId);
    		const initialCode = window.localStorage.getItem(lsCodeKey) || "";

    		editorHandler = editor({
    			render,
    			lang,
    			lsCodeKey,
    			rootId,
    			docUrl,
    			initialCode
    		});
    	});

    	async function setKeys(url, rootId) {
    		await refresh(url, rootId);
    		window.location.reload();
    	}

    	async function refresh(url, rootId) {
    		window.localStorage.setItem(lsDocKey, url);
    		window.localStorage.setItem(lsIdKey, rootId);
    		$$invalidate(0, ifrSrc = await render(url, rootId));
    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => setLanguage("html");
    	const click_handler_1 = () => setLanguage("javascript");

    	function input0_input_handler() {
    		docUrl = this.value;
    		$$invalidate(3, docUrl);
    	}

    	const change_handler = () => setKeys(docUrl, rootId);

    	function input1_input_handler() {
    		rootId = this.value;
    		$$invalidate(2, rootId);
    	}

    	const change_handler_1 = () => setKeys(docUrl, rootId);

    	$$self.$capture_state = () => ({
    		onMount,
    		RefreshIcon,
    		WorldIcon,
    		TagHtmlIcon,
    		render,
    		editor,
    		lsLangKey,
    		lsIdKey,
    		lsDocKey,
    		lsCodeKey,
    		ifrSrc,
    		editorHandler,
    		lang,
    		rootId,
    		docUrl,
    		setLanguage,
    		setKeys,
    		refresh
    	});

    	$$self.$inject_state = $$props => {
    		if ("ifrSrc" in $$props) $$invalidate(0, ifrSrc = $$props.ifrSrc);
    		if ("editorHandler" in $$props) editorHandler = $$props.editorHandler;
    		if ("lang" in $$props) $$invalidate(1, lang = $$props.lang);
    		if ("rootId" in $$props) $$invalidate(2, rootId = $$props.rootId);
    		if ("docUrl" in $$props) $$invalidate(3, docUrl = $$props.docUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ifrSrc,
    		lang,
    		rootId,
    		docUrl,
    		setLanguage,
    		setKeys,
    		editorHandler,
    		refresh,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		change_handler,
    		input1_input_handler,
    		change_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById('app'),
    	props: {

    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
