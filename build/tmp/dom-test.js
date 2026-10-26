'use strict';
/* Minimal DOM stub to smoke-test the top-bar GUIDES menu builder in shell.js:
   - the tree is built (1 tn-item, 80 tn-links, 11 tn-cat-h)
   - the current page's link gets .cur
   - the filter hides non-matching links and empty category headers
   - open/close toggling works
*/
const fs = require('fs');
const vm = require('vm');

class El {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
    this.style = {};
    this._handlers = {};
    this._text = '';
    this._className = '';
    this.parentNode = null;
  }
  set className(v) { this._className = v; }
  get className() { return this._className; }
  classList = {
    add: (c) => { if (!this._className.split(' ').includes(c)) this._className += (this._className ? ' ' : '') + c; },
    remove: (c) => { this._className = this._className.split(' ').filter((x) => x && x !== c).join(' '); },
    toggle: (c, force) => {
      const has = this._className.split(' ').includes(c);
      const want = force !== undefined ? !!force : !has;
      if (want && !has) this.classList.add(c);
      if (!want && has) this.classList.remove(c);
      return want;
    },
    contains: (c) => this._className.split(' ').includes(c),
  };
  set textContent(v) { this._text = String(v); }
  get textContent() { return this._text; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); }
  dispatch(t, ev) { const e = ev || { target: this }; if (!e.stopPropagation) e.stopPropagation = () => {}; (this._handlers[t] || []).forEach((fn) => fn(e)); }
  focus() {}
  contains(node) { let n = node; while (n) { if (n === this) return true; n = n.parentNode; } return false; }
  querySelector(sel) { return find(this, sel); }
  querySelectorAll(sel) { const out = []; walk(this, sel, out); return out; }
}

function matches(el, sel) {
  if (sel === '.tn-item') return el.classList.contains('tn-item');
  if (sel === '.tn-cat-h') return el.classList.contains('tn-cat-h');
  if (sel === '.tn-link') return el.classList.contains('tn-link');
  if (sel === '.tn-menu') return el.classList.contains('tn-menu');
  if (sel === '.tn-btn') return el.classList.contains('tn-btn');
  if (sel === '.tn-filter input') return el.tagName === 'input';
  if (sel === '[data-mode]') return el.attributes['data-mode'] !== undefined;
  if (sel.indexOf('.') === 0) return el.classList.contains(sel.slice(1));
  return el.tagName === sel.toUpperCase();
}
function find(el, sel) { if (matches(el, sel)) return el; for (const c of el.children) { const r = find(c, sel); if (r) return r; } return null; }
function walk(el, sel, out) { for (const c of el.children) { if (matches(c, sel)) out.push(c); walk(c, sel, out); } }

const topnav = new El('nav');
const documentEl = new El('html');
const body = new El('body');
const document2 = {
  documentElement: documentEl,
  body,
  getElementById() { return topnav; },
  createElement: (t) => new El(t),
  createElementNS: (_ns, t) => new El(t),
  addEventListener() {},
};

const scroll = { getBoundingClientRect: () => ({ height: 0 }) };
const win = { matchMedia: () => ({ matches: true }) };
const loc = { pathname: '/guides/flutter.html' };

const source = fs.readFileSync('assets/shell.js', 'utf8');
const builder = source.slice(source.indexOf('var GUIDES_CATALOG'));

const sandbox = {
  document: document2,
  window: win,
  location: loc,
  console,
};
vm.createContext(sandbox);
vm.runInContext(builder, sandbox);

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

const item = topnav.children[0];
check('topnav has exactly one tn-item', topnav.children.length === 1 && item.classList.contains('tn-item'));
const btn = item.querySelector('.tn-btn');
const menu = item.querySelector('.tn-menu');
check('tn-item has a .tn-btn and .tn-menu', !!btn && !!menu);
const links = item.querySelectorAll('.tn-link');
check('menu has 80 guide links', links.length === 80);
const heads = item.querySelectorAll('.tn-cat-h');
check('menu has 11 category headers', heads.length === 11);
const cur = links.filter((l) => l.classList.contains('cur'));
check('current page (flutter.html) is marked .cur', cur.length === 1 && cur[0].attributes['data-file'] === 'flutter.html');

// open/close toggle via button click
check('aria-expanded starts false', btn.getAttribute('aria-expanded') === 'false');
btn.dispatch('click', { target: btn });
check('click opens the menu', item.classList.contains('open') && btn.getAttribute('aria-expanded') === 'true');
btn.dispatch('click', { target: btn });
check('second click closes the menu', !item.classList.contains('open'));

// filter: typing "flutter" should leave 1 link visible, all other links hidden
btn.dispatch('click', { target: btn });
const input = item.querySelector('.tn-filter input');
input.value = 'flutter';
input.dispatch('input', { target: input });
const vis = links.filter((l) => l.style.display !== 'none');
check('filter "flutter" leaves exactly 1 visible link', vis.length === 1 && vis[0].attributes['data-file'] === 'flutter.html');
const emptyHeads = heads.filter((h) => h.style.display === 'none');
check('filter hides category headers with no visible links', emptyHeads.length === 10);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);