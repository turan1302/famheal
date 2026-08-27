/**
 * RN 0.82 codegen only accepts React.ElementRef in NativeCommands.
 * Newer react-native-screens (and others) use React.ComponentRef.
 * Apply a small compatibility fix after install.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function patchScreensElementRef() {
  const fabricDir = path.join(
    root,
    'node_modules',
    'react-native-screens',
    'src',
    'fabric',
  );
  let changed = 0;
  for (const file of walk(fabricDir)) {
    const original = fs.readFileSync(file, 'utf8');
    if (!original.includes('React.ComponentRef')) continue;
    fs.writeFileSync(
      file,
      original.replace(/React\.ComponentRef/g, 'React.ElementRef'),
    );
    changed += 1;
  }
  if (changed > 0) {
    console.log(
      `[patch-rn-codegen-compat] react-native-screens: ComponentRef -> ElementRef in ${changed} file(s)`,
    );
  }
}

function patchCodegenParser() {
  const file = path.join(
    root,
    'node_modules',
    '@react-native',
    'codegen',
    'lib',
    'parsers',
    'typescript',
    'components',
    'commands.js',
  );
  if (!fs.existsSync(file)) return;

  let source = fs.readFileSync(file, 'utf8');
  if (source.includes("['ElementRef', 'ComponentRef']")) return;

  const needle =
    ": _firstParam$typeAnnot2.name) === 'ElementRef'\n    )\n  ) {";
  const replacement =
    ": ['ElementRef', 'ComponentRef'].includes(_firstParam$typeAnnot2.name))\n    )\n  ) {";

  if (!source.includes(needle)) {
    console.warn(
      '[patch-rn-codegen-compat] @react-native/codegen pattern not found; skip',
    );
    return;
  }

  source = source.replace(needle, replacement);
  fs.writeFileSync(file, source);
  console.log(
    '[patch-rn-codegen-compat] @react-native/codegen: accept ComponentRef',
  );
}

patchScreensElementRef();
patchCodegenParser();
