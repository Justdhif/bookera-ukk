/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function isCodeFile(filePath) {
  return /\.(tsx?|jsx?)$/i.test(filePath);
}

function addUsed(usedByNamespace, namespace, keyPath) {
  if (!usedByNamespace.has(namespace)) usedByNamespace.set(namespace, new Set());
  usedByNamespace.get(namespace).add(keyPath);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasDynamicUsage(content, varName) {
  const v = escapeRegExp(varName);
  const nonLiteralCall = new RegExp("\\b" + v + "\\s*\\(\\s*(?!['\"`])", "g");
  const nonLiteralRichRaw = new RegExp(
    "\\b" + v + "\\s*\\.(?:rich|raw)\\s*\\(\\s*(?!['\"`])",
    "g",
  );
  const templateWithExpr = new RegExp(
    "\\b" + v + "\\s*(?:\\.|\\s*)\\(?\\s*`[^`]*\\$\\{[\\s\\S]*?\\}[^`]*`",
    "g",
  );

  return nonLiteralCall.test(content) || nonLiteralRichRaw.test(content) || templateWithExpr.test(content);
}

function scanContent(content, usedByNamespace, keepAllNamespaces) {
  // Pattern: useTranslations('ns')('key')
  for (const m of content.matchAll(
    /useTranslations\(\s*['"]([^'"]+)['"]\s*\)\s*\(\s*['"]([^'"]+)['"]\s*(?:,|\))/g,
  )) {
    addUsed(usedByNamespace, m[1], m[2]);
  }

  // Pattern: useTranslations('ns').rich('key') / .raw('key')
  for (const m of content.matchAll(
    /useTranslations\(\s*['"]([^'"]+)['"]\s*\)\s*\.(rich|raw)\s*\(\s*['"]([^'"]+)['"]/g,
  )) {
    addUsed(usedByNamespace, m[1], m[3]);
  }

  // Server-side: getTranslations('ns') / getTranslations({namespace:'ns'})
  for (const m of content.matchAll(/getTranslations\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    // If code uses getTranslations(ns) then later t('...') might be dynamic; safest keep all.
    keepAllNamespaces.add(m[1]);
  }
  for (const m of content.matchAll(
    /getTranslations\(\s*\{[^}]*\bnamespace\s*:\s*['"]([^'"]+)['"][^}]*\}\s*\)/g,
  )) {
    keepAllNamespaces.add(m[1]);
  }

  // Capture var names: const t = useTranslations('ns')
  const varToNamespace = new Map();
  for (const m of content.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g,
  )) {
    varToNamespace.set(m[1], m[2]);
  }

  for (const [varName, namespace] of varToNamespace.entries()) {
    if (hasDynamicUsage(content, varName)) {
      keepAllNamespaces.add(namespace);
    }

    // t('key') / t("key")
    const v = escapeRegExp(varName);
    const callStr = new RegExp("\\b" + v + "\\s*\\(\\s*['\"]([^'\"]+)['\"]", "g");
    for (const m of content.matchAll(callStr)) {
      addUsed(usedByNamespace, namespace, m[1]);
    }

    // t.rich('key') / t.raw('key')
    const richRawStr = new RegExp(
      "\\b" + v + "\\s*\\.(?:rich|raw)\\s*\\(\\s*['\"]([^'\"]+)['\"]",
      "g",
    );
    for (const m of content.matchAll(richRawStr)) {
      addUsed(usedByNamespace, namespace, m[1]);
    }

    // Template literal key without expressions: t(`key.path`)
    const callTpl = new RegExp("\\b" + v + "\\s*\\(\\s*`([^$`]+)`", "g");
    for (const m of content.matchAll(callTpl)) {
      addUsed(usedByNamespace, namespace, m[1]);
    }
  }
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function pruneByPaths(node, usedPaths, prefixParts = []) {
  if (!isPlainObject(node)) return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    const nextPrefix = [...prefixParts, key];
    const exactPath = nextPrefix.join(".");

    // Keep leaf if exact path used OR leaf key itself used (common when namespace is flat)
    const leafKeyUsed = usedPaths.has(key);
    const exactPathUsed = usedPaths.has(exactPath);

    if (isPlainObject(value)) {
      const prunedChild = pruneByPaths(value, usedPaths, nextPrefix);
      if (isPlainObject(prunedChild) && Object.keys(prunedChild).length > 0) {
        out[key] = prunedChild;
        continue;
      }

      // If someone used the object as a leaf (rare) keep it
      if (exactPathUsed) {
        out[key] = value;
      }

      continue;
    }

    if (exactPathUsed || leafKeyUsed) {
      out[key] = value;
    }
  }

  return out;
}

function countLeaves(obj) {
  if (!isPlainObject(obj)) return 0;
  let count = 0;
  for (const v of Object.values(obj)) {
    if (isPlainObject(v)) count += countLeaves(v);
    else count += 1;
  }
  return count;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const writeInPlace = !args.has("--out");

  const repoRoot = path.resolve(__dirname, "..");
  const srcDir = path.join(repoRoot, "src");
  const dictDir = path.join(repoRoot, "dictionaries");
  const enPath = path.join(dictDir, "en.json");
  const idPath = path.join(dictDir, "id.json");
  const outEnPath = writeInPlace ? enPath : path.join(dictDir, "en.pruned.json");
  const outIdPath = writeInPlace ? idPath : path.join(dictDir, "id.pruned.json");

  const files = walk(srcDir).filter(isCodeFile);
  const usedByNamespace = new Map();
  const keepAllNamespaces = new Set();

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    scanContent(content, usedByNamespace, keepAllNamespaces);
  }

  const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const id = JSON.parse(fs.readFileSync(idPath, "utf8"));

  function pruneDict(dict) {
    const out = {};
    for (const namespace of Object.keys(dict)) {
      if (keepAllNamespaces.has(namespace)) {
        out[namespace] = dict[namespace];
        continue;
      }

      const used = usedByNamespace.get(namespace);
      if (!used || used.size === 0) continue;

      const pruned = pruneByPaths(dict[namespace], used);
      if (isPlainObject(pruned) && Object.keys(pruned).length > 0) {
        out[namespace] = pruned;
      }
    }
    return out;
  }

  const prunedEn = pruneDict(en);
  const prunedId = pruneDict(id);

  fs.writeFileSync(outEnPath, JSON.stringify(prunedEn, null, 2) + "\n");
  fs.writeFileSync(outIdPath, JSON.stringify(prunedId, null, 2) + "\n");

  const removedNamespaces = (orig, pruned) => Object.keys(orig).filter((k) => !(k in pruned));

  console.log("keepAll namespaces:", [...keepAllNamespaces].sort().join(", ") || "(none)");
  console.log("removed namespaces (en):", removedNamespaces(en, prunedEn).join(", ") || "(none)");
  console.log("removed namespaces (id):", removedNamespaces(id, prunedId).join(", ") || "(none)");
  console.log("leaf count en:", countLeaves(en), "->", countLeaves(prunedEn));
  console.log("leaf count id:", countLeaves(id), "->", countLeaves(prunedId));
  if (writeInPlace) {
    console.log("wrote in-place:", path.relative(repoRoot, enPath));
    console.log("wrote in-place:", path.relative(repoRoot, idPath));
  } else {
    console.log("wrote:", path.relative(repoRoot, outEnPath));
    console.log("wrote:", path.relative(repoRoot, outIdPath));
  }
}

main();
