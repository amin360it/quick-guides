$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-dual" data-toc>Dual publishing: ESM and CommonJS</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-dual at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-dual-build-both">Build both ESM and CJS</h4>
    <p>Node treats .js as CommonJS unless the nearest package.json says "type": "module". Bundlers prefer ESM. A modern package shipping only ESM breaks require() consumers, and a CJS-only package gets named export errors in Node ESM.</p>
    <div class="codeWrap"><pre><code>
// Build both ESM and CJS with tsup/rollup/esbuild
{
  "scripts": { "build": "tsup" },
  "type": "module"
}
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
});
// this emits: dist/index.js ESM, dist/index.cjs CJS, dist/index.d.ts
</code></pre></div>

    <h4 id="ch4-dual-esm-trap">ESM interop trap</h4>
    <p>A CJS module can only export ONE thing to a named ESM import. module.exports = { foo, bar } works in most bundlers but fails in Node ESM named-export detection over source text. The fix: publish real ESM. Do not rely on the heuristic.</p>
    <div class="codeWrap"><pre><code>
// ESM interop trap: named export from CJS
module.exports = { foo, bar }
// importing { foo } from "pkg" works in most bundlers
// but in Node's ESM the named-export detection is a heuristic over source text
// and it fails on: module.exports = { ...require('./other'), extra: 1 }
// symptom: SyntaxError: The requested module 'pkg' does not provide an export named 'foo'
</code></pre></div>

    <h4 id="ch4-dual-verify-both">Verify both paths</h4>
    <p>Run both entry points in CI. A package that only ever tests its ESM build will break CJS consumers without anyone noticing until a bug report.</p>
    <div class="codeWrap"><pre><code>
// Verify both entry points in CI
$ node -e "const m = require('./dist/index.cjs'); console.log(Object.keys(m))"
$ node --input-type=module -e "
  import { foo } from './dist/index.js';
  console.log(typeof foo);
"
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-dual"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-dual done, new length: $($content.Length)"