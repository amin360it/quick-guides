$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

# Define all ch2 h3 tags and their h4 content as an array of ordered pairs
$ch2H3Tags = @(
    '<h3 id="ch2-ci" data-toc>Building in CI and only in CI</h3>',
    '<h3 id="ch2-sourcemaps" data-toc>Source maps and debuggability</h3>',
    '<h3 id="ch2-typosquat" data-toc>Name collisions and typosquatting</h3>',
    '<h3 id="ch2-scopes" data-toc>Scopes, and publishing under a namespace</h3>',
    '<h3 id="ch2-monorepo" data-toc>Monorepos and per-package releases</h3>',
    '<h3 id="ch2-fat" data-toc>Minimising the published surface</h3>'
)

$ch2H4Content = @()
# ch2-ci
$ch2H4Content[0] = @"
    <h4 id="ch2-ci-cicd-pipeline">CI pipeline shape</h4>
    <p>A release pipeline triggered by git tags is the standard pattern. It combines signed annotated tags, protected tag patterns, and short-lived OIDC credentials so a stolen laptop token cannot publish.</p>
    <div class="codeWrap"><pre><code>
// Git tag-triggered release pipeline
git tag -s -m "v1.2.3" 1.2.3
git push origin v1.2.3

// GitHub Actions release pipeline
name: release
on: push:
  tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with: { persist-credentials: false }
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm pack --dry-run
      - name: publish
        env: NODE_AUTH_TOKEN
        run: npm publish --provenance --access public
</code></pre></div>

    <h4 id="ch2-ci-protections">Four rules for safe publishing</h4>
    <p>1. BUILD IN CI. Never publish from a laptop. Ever. 2. PROTECT THE TAG. Require signed tags and a protected release environment with reviewers. 3. USE SHORT-LIVED CREDENTIALS. OIDC exchange means no long-lived secret to steal. 4. VERIFY BEFORE PUBLISH. Check the artefact with a test, not confidence.</p>
    <div class="codeWrap"><pre><code>
// THE FOUR RULES
//   1. BUILD IN CI. Never publish from a laptop. Ever.
//   2. PROTECT THE TAG. Require signed tags and a protected release environment with reviewers
//   3. USE SHORT-LIVED CREDENTIALS. OIDC exchange means no long-lived secret.
//   4. VERIFY BEFORE PUBLISH. The artefact you ship is checked by a test.
</code></pre></div>

    <h4 id="ch2-ci-tag-trigger">Tag-triggered release pattern</h4>
    <p>The tag is the immutable statement of intent. Combine with: signed annotated tags, and a protected tag pattern in the repository settings.</p>
    <div class="codeWrap"><pre><code>
// Standard tag-triggered pipeline
git tag -s -m "v1.2.3" 1.2.3
git push origin v1.2.3
</code></pre></div>
"@
# ch2-sourcemaps
$ch2H4Content[1] = @"
    <h4 id="ch2-sm-types">Type declarations are not optional</h4>
    <p>Ship the .d.ts file, or consumers get an implicit-any error at their import. This is the single most common reason a TS package is described as "broken" and it is a packaging failure, not a bug.</p>
    <div class="codeWrap"><pre><code>
// TypeScript declarations are not optional for a TS-first package
//   ship the .d.ts, or consumers get an implicit-any error at their import
"types": "./dist/index.d.ts",
</code></pre></div>

    <h4 id="ch2-sm-exports">exports field for resolution</h4>
    <p>The exports field enforces the public API. Deep-imports outside the exports field stop resolving for consumers. This is a breaking change for anyone deep-importing, so do it in a major release.</p>
    <div class="codeWrap"><pre><code>
// Enforce the public API with exports
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
}
</code></pre></div>

    <h4 id="ch2-sm-type-reveal">Type reveal in debugger</h4>
    <p>Source maps resolve frames into YOUR source, even though the consumer only has your dist. Add "sourceRoot" so a browser can fetch the original file from the registry.</p>
    <div class="codeWrap"><pre><code>
// Add sourceRoot so browser can fetch original
"sourceRoot": "https://unpkg.com/your-pkg@1.2.3/"
</code></pre></div>
"@
# ch2-typosquat
$ch2H4Content[2] = @"
    <h4 id="ch2-typosq-lockfiles">Lockfiles pin integrity hashes</h4>
    <p>A lockfile pins the integrity hash of every dependency, so a typosquatted package cannot be swapped in without a lockfile change you would see in review. Always commit your lockfile for applications.</p>
    <div class="codeWrap"><pre><code>
// Example: npm ls resolved hashes
$ npm ls --all --json | jq -r '
    .dependencies | to_entries[] |
    "\(.value.resolved // "none")  \(.key)"' \
  | awk '{print $1}' | sed 's|https://registry.npmjs.org/||' \
  | grep -v '^none$' | sort -u | head
</code></pre></div>

    <h4 id="ch2-typosq-scope">Scopes and namespace namespaces</h4>
    <p>A scope (npm) or group ID (Maven) is a registered namespace, making typosquatting much harder. Use scoped packages for anything with more than one maintainer.</p>
    <div class="codeWrap"><pre><code>
// npm scope: @yourorg/name
npm login --scope=@yourorg
npm publish --access public

// Maven groupId: com.yourorg.library
//   central repository requires domain verification
</code></pre></div>

    <h4 id="ch2-typosq-ci-check">CI step to detect typosquatting</h4>
    <p>Resolve every dependency and fail if any comes from an unexpected registry. Test by pointing one dependency at a URL you do not expect.</p>
    <div class="codeWrap"><pre><code>
// CI step to detect typosquatting
$ npm ls --all --json | jq -r '
    .dependencies | to_entries[] |
    "\(.value.resolved // "none")  \(.key)"' \
  | awk '{print $1}' | sed 's|https://registry.npmjs.org/||' \
  | grep -v '^none$' | sort -u | head
</code></pre></div>
"@
# ch2-scopes
$ch2H4Content[3] = @"
    <h4 id="ch2-scopes-npm">npm scopes: @org/name</h4>
    <p>The scope is a namespace you own. The package name is then @yourorg/thing, which removes typosquatting risk entirely for your internal packages, and makes ownership obvious.</p>
    <div class="codeWrap"><pre><code>
// npm scopes: @org/name
npm login --scope=@yourorg
npm publish --access public
// a private scope is free and unlimited on the free tier
</code></pre></div>

    <h4 id="ch2-scopes-maven">Maven group ids: com.yourorg.library</h4>
    <p>The groupId is a namespace, and the central repository requires you to verify ownership of a domain matching it. This is why "com.google.guava" exists and why a squat on com.yourorg is prevented by domain verification.</p>
    <div class="codeWrap"><pre><code>
// Maven group id: com.yourorg.library
//   central repository requires domain verification
</code></pre></div>

    <h4 id="ch2-scopes-pypi">PyPI: organisation accounts</h4>
    <p>Organisation accounts are free, and they own projects and their transfers. Use one for anything with more than one maintainer, and put a working email on it, because PyPI account recovery is email-based.</p>
    <div class="codeWrap"><pre><code>
// PyPI organisation account: free, owns projects and transfers
</code></pre></div>

    <h4 id="ch2-scopes-reserve">Reserve crate names on crates.io</h4>
    <p>A verified GitHub organisation or domain can reserve a crate name without publishing, so nobody takes it. Do this for every name you might ever use.</p>
    <div class="codeWrap"><pre><code>
// crates.io: reserve a name without publishing
//   reserve via verified organisation or domain
</code></pre></div>
"@
# ch2-monorepo
$ch2H4Content[4] = @"
    <h4 id="ch2-mono-changesets">Changeset flow for independent releases</h4>
    <p>A changeset is a markdown file describing one change to one package. Tools like turbo or nx generate a release PR from accumulated changesets, computing versions from bump types. This is the most common modern answer to the monorepo release problem.</p>
    <div class="codeWrap"><pre><code>
// Changeset example
// packages/changesets/brave-lions-jump.md
//
// ---
// "@yourorg/core": minor
// "fix: handle a null token in refresh()"
// ---
// a release PR is generated from the accumulated changesets
</code></pre></div>

    <h4 id="ch2-mono-changelog">Per-package changelogs</h4>
    <p>A monorepo changelog is useless. Generate per-package changelogs from the changesets, and keep a root CHANGELOG that only records changes to the public workspace API.</p>
    <div class="codeWrap"><pre><code>
// Root CHANGELOG only records workspace API changes
// Per-package changelogs generated from changesets
</code></pre></div>

    <h4 id="ch2-mono-version-prop">Version propagation rules</h4>
    <p>If @yourorg/plugin requires @yourorg/core ^1.2.0 and core goes to 2.0.0, the plugin must be released too, and its new version must widen its range. Write the rule down because exception cases accumulate.</p>
    <div class="codeWrap"><pre><code>
// Version propagation: if core bumps, plugin range must widen
// Write the rule down because exception cases accumulate
</code></pre></div>
"@
# ch2-fat
$ch2H4Content[5] = @"
    <h4 id="ch2-fat-files">The "files" field is authoritative</h4>
    <p>Without "files", npm uses .gitignore, and then everything you have ignored is published too. With "files", the list is authoritative. Always set it.</p>
    <div class="codeWrap"><pre><code>
// Always set the "files" field
"files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"]
</code></pre></div>

    <h4 id="ch2-fat-accidental">Files that always get in by accident</h4>
    <p>CI configuration (.github, .gitlab-ci.yml, Jenkinsfile), Dockerfiles, compose files, test fixtures, editor directories (.idea, .vscode), and .env files often ship by accident. Check specifically for .env files.</p>
    <div class="codeWrap"><pre><code>
// Common files that accidentally ship
//   - CI configuration: .github, .gitlab-ci.yml, Jenkinsfile
//   - Dockerfiles and compose files
//   - test fixtures, often large
//   - editor directories: .idea, .vscode
//   - .env files. Check for this specifically.
</code></pre></div>

    <h4 id="ch2-fat-budget">Size budget in CI</h4>
    <p>Set a budget and fail the build if the artefact grows by more than a set percentage. A package that grows 10 MB in a release is usually a mistake, and it is invisible without this check.</p>
    <div class="codeWrap"><pre><code>
// Verify the size in CI
$ npm pack --dry-run
npm notice package size: 1.2 MB
npm notice unpacked size: 4.8 MB
// set a budget and fail the build if it is exceeded
</code></pre></div>
"@
)

# Process each section - ch2-ci was already done earlier, start from ch2-sourcemaps
Write-Host "Processing ch2 sections for h4 insertion"
$startIdx = 1  # ch2-ci already done

for ($i = $startIdx; $i -lt $ch2H3Tags.Length; $i++) {
    $h3Tag = $ch2H3Tags[$i]
    $h4s = $ch2H4Content[$i]
    
    Write-Host "Processing: $h3Tag"
    
    $h3Pos = $content.IndexOf($h3Tag)
    if ($h3Pos -ge 0) {
        # Find the codeWrap opening after the h3
        $cwOpen = '<div class="codeWrap"><pre><code>'
        $cwPos = $content.IndexOf($cwOpen, $h3Pos)
        
        if ($cwPos -ge 0) {
            # Insert the h4s before the codeWrap
            $content = $content.Insert($cwPos, $h4s)
            Write-Host "  -> Inserted h4s for $h3Tag"
        } else {
            Write-Host "  -> codeWrap not found for $h3Tag"
        }
    } else {
        Write-Host "  -> h3 not found: $h3Tag"
    }
}

# Write the modified content back
[System.IO.File]::WriteAllText($file, $content)
Write-Host "File written successfully. Sections processed: $($ch2H3Tags.Length - $startIdx)"