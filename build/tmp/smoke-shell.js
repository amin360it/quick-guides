'use strict';
/* Run ALL of assets/shell.js under a DOM stub. Asserts:
   - no exception while executing the whole file
   - the theme button click flips data-theme and the icons
   - all 10 mode rows are built in #modePop
   - the GUIDES menu is still built with 80 links
*/
const fs = require('fs');
const vm = require('vm');

class El {
  constructor(tag) {
    this.tagName = tag; this.children = []; this.attributes = {}; this.style = {};
    this._handlers = {}; this._text = ''; this._className = ''; this.parentNode = null;
    this.hidden = false;
  }
  set className(v) { this._className = v; }
  get className() { return this._className; }
  classList = {
    add: (c) => { if (!this._className.split(' ').includes(c)) this._className += (this._className ? ' ' : '') + c; },
    remove: (c) => { this._className = this._className.split(' ').filter((x) => x && x !== c).join(' '); },
    toggle: (c, force) => { const has = this._className.split(' ').includes(c); const want = force !== undefined ? !!force : !has; if (want && !has) this.classList.add(c); if (!want && has) this.classList.remove(c); return want; },
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
  closest(sel) { let n = this; while (n) { if (matches(n, sel)) return n; n = n.parentNode; } return null; }
  querySelector(sel) { return find(this, sel); }
  querySelectorAll(sel) { const out = []; walk(this, sel, out); return out; }
}
function matches(el, sel) {
  const map = { '.tn-item': 'tn-item', '.tn-cat-h': 'tn-cat-h', '.tn-link': 'tn-link', '.tn-btn': 'tn-btn', '.tn-menu': 'tn-menu', '.mode-opt': 'mode-opt', '.mode-dot': 'mode-dot', '.mode-name': 'mode-name', '.mode-tick': 'mode-tick' };
  if (sel === '.tn-filter input') return el.tagName === 'input';
  if (sel === '[data-mode]') return el.attributes['data-mode'] !== undefined;
  if (sel === '[aria-checked="true"]') return el.attributes['aria-checked'] === 'true';
  if (map[sel]) return el.classList.contains(map[sel]);
  if (sel.indexOf('.') === 0) return el.classList.contains(sel.slice(1));
  return el.tagName === sel.toUpperCase();
}
function find(el, sel) { if (matches(el, sel)) return el; for (const c of el.children) { const r = find(c, sel); if (r) return r; } return null; }
function walk(el, sel, out) { for (const c of el.children) { if (matches(c, sel)) out.push(c); walk(c, sel, out); } }

const topnav = new El('nav');
const themeBtn = new El('button'); const icSun = new El('svg'); const icMoon = new El('svg');
const themeLabel = new El('span');
const modeBtn = new El('button'); const modePop = new El('div'); const modeSwatch = new El('span'); const modeLabel = new El('span');
const inputs = {};
const root = new El('html');
root.attributes['data-theme'] = 'dark';
root.attributes['data-mode'] = 'default';

const store = {};
const document2 = {
  documentElement: root,
  getElementById(id) {
    if (id === 'topnav') return topnav;
    if (id === 'themeBtn') return themeBtn;
    if (id === 'icSun') return icSun;
    if (id === 'icMoon') return icMoon;
    if (id === 'themeLabel') return themeLabel;
    if (id === 'modeBtn') return modeBtn;
    if (id === 'modePop') return modePop;
    if (id === 'modeSwatch') return modeSwatch;
    if (id === 'modeLabel') return modeLabel;
    return null;
  },
  createElement: (t) => new El(t),
  createElementNS: (_ns, t) => new El(t),
  addEventListener() {},
  querySelector() { return null; },
};

const sandbox = {
  document: document2,
  window: { matchMedia: () => ({ matches: true }) },
  location: { pathname: '/guides/csharp.html' },
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  console,
};

vm.createContext(sandbox);
const source = fs.readFileSync('assets/shell.js', 'utf8');
let threw = null;
try { vm.runInContext(source, sandbox); } catch (e) { threw = e; }

let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('  ok - ' + name); } else { fail++; console.log('  FAIL - ' + name); } }

check('whole shell.js executes without throwing', threw === null);
check('topnav menu built (80 links)', find(topnav, '.tn-link') && topnav.querySelectorAll('.tn-link').length === 80);
const modeRows = modePop.querySelectorAll('[data-mode]');
check('mode popover has 10 rows', modeRows.length === 10);
check('current page marked .cur in menu', topnav.querySelectorAll('.tn-link').filter((l) => l.classList.contains('cur')).length === 1);

// theme toggle: click themeBtn -> data-theme flips, icons swap
check('theme starts dark', root.getAttribute('data-theme') === 'dark');
themeBtn.dispatch('click');
check('click flips theme to light', root.getAttribute('data-theme') === 'light');
check('sun shown in light', icSun.style.display !== 'none');
check('moon hidden in light', icMoon.style.display === 'none');
check('label describes the action (Dark mode)', themeLabel.textContent === 'Dark mode');
check('stored theme persisted', store['amin360it-theme'] === 'light');

// mode toggle: click a mode row -> data-mode changes, stored
// (real browsers bubble the click from the row up to #modePop; the stub can't,
//  so dispatch on the popover with the row as the event target)
modePop.dispatch('click', { target: modeRows[3] });
check('clicking a mode row updates data-mode', root.getAttribute('data-mode') === 'tokyo');
check('mode stored in localStorage', store['amin360it-mode'] === 'tokyo');

// second theme click back to dark
themeBtn.dispatch('click');
check('second click returns to dark', root.getAttribute('data-theme') === 'dark');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);