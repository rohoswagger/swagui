/**
 * Converts registry/theme/swagui.css into the `theme` registry item's
 * cssVars/css payload in registry.json.
 *
 * Why: a `registry:file` item drops app/swagui.css into the project but cannot
 * add the `@import` that makes it do anything, so an install silently has no
 * effect until the user edits globals.css by hand. cssVars/css are merged
 * straight into the project's stylesheet instead.
 *
 * swagui.css stays the authoring source; this is a build step.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const CSS_PATH = "registry/theme/swagui.css"
const REGISTRY_PATH = "registry.json"

/** Strip comments, then parse nested CSS into plain objects. */
function parse(css) {
  let i = 0
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "")

  function block() {
    const out = {}
    let buf = ""
    while (i < src.length) {
      const ch = src[i]
      if (ch === "}") {
        i++
        break
      }
      if (ch === "{") {
        i++
        const sel = buf.trim()
        const parsed = block()
        // A selector can legitimately appear more than once (e.g. `.dark`
        // carries colours in one block and a surface token in another).
        // Merge rather than overwrite, or the earlier block is silently lost.
        out[sel] = out[sel] ? { ...out[sel], ...parsed } : parsed
        buf = ""
        continue
      }
      if (ch === ";") {
        i++
        const decl = buf.trim()
        buf = ""
        if (!decl) continue
        const idx = decl.indexOf(":")
        // At-statements with no block, e.g. @import "x" or @custom-variant …
        if (idx === -1 || decl.startsWith("@")) {
          out[decl] = ""
        } else {
          out[decl.slice(0, idx).trim()] = decl.slice(idx + 1).trim()
        }
        continue
      }
      buf += ch
      i++
    }
    return out
  }

  return block()
}

/** cssVars keys are written without the leading `--`. */
function toVars(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("--")) out[k.slice(2)] = String(v)
  }
  return out
}

const tree = parse(readFileSync(CSS_PATH, "utf8"))

const cssVars = {
  theme: toVars(tree["@theme inline"] ?? {}),
  light: toVars(tree[":root"] ?? {}),
  dark: toVars(tree[".dark"] ?? {}),
}

// Everything that is not a plain :root/.dark/@theme variable bag: the dark
// variant, the animation import, the data-* scopes, and the base/component
// layers. These have to land as real rules, not variables.
const HANDLED = new Set(["@theme inline", ":root", ".dark"])
const css = {}
for (const [selector, body] of Object.entries(tree)) {
  if (HANDLED.has(selector)) continue
  css[selector] = body
}

// `.dark` also carries a non-variable override (--inset-highlight is a var, but
// the surface scopes redefine vars on selectors we keep in `css`), so make sure
// any var-only leftovers under kept selectors survive as-is.

const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"))
const theme = registry.items.find((i) => i.name === "theme")
if (!theme) throw new Error("no `theme` item in registry.json")

theme.type = "registry:style"
theme.dependencies = ["tw-animate-css"]
theme.cssVars = cssVars
theme.css = css
delete theme.files

writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n")

// `shadcn build` silently skips items that have no `files`, so this one is
// emitted directly. Run this script after `shadcn build`.
// This now runs before `shadcn build`, so the output dir may not exist yet.
mkdirSync("public/r", { recursive: true })

writeFileSync(
  "public/r/theme.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: theme.name,
      type: theme.type,
      title: theme.title,
      description: theme.description,
      dependencies: theme.dependencies,
      cssVars: theme.cssVars,
      css: theme.css,
    },
    null,
    2
  ) + "\n"
)

console.log(
  `theme: ${Object.keys(cssVars.theme).length} theme vars, ` +
    `${Object.keys(cssVars.light).length} light, ` +
    `${Object.keys(cssVars.dark).length} dark, ` +
    `${Object.keys(css).length} css rules`
)
