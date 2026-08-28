/**
 * Release Android builds need node_modules/react-native/sdks/hermesc/<os>/hermesc.
 * On macOS that file is sometimes missing or stripped by Gatekeeper. Restore it
 * from the installed react-native npm tarball and drop the quarantine flag.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');

function hermesOsBin() {
  if (process.platform === 'darwin') return 'osx-bin';
  if (process.platform === 'win32') return 'win64-bin';
  if (process.platform === 'linux') return 'linux64-bin';
  return null;
}

function hermescName() {
  return process.platform === 'win32' ? 'hermesc.exe' : 'hermesc';
}

function clearQuarantine(filePath) {
  if (process.platform !== 'darwin' || !fs.existsSync(filePath)) {
    return;
  }
  spawnSync('xattr', ['-d', 'com.apple.quarantine', filePath], {
    stdio: 'ignore',
  });
}

function ensureHermesc() {
  const osBin = hermesOsBin();
  if (!osBin) {
    return;
  }

  const destDir = path.join(
    root,
    'node_modules',
    'react-native',
    'sdks',
    'hermesc',
    osBin,
  );
  const dest = path.join(destDir, hermescName());
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    fs.chmodSync(dest, 0o755);
    clearQuarantine(dest);
    return;
  }

  const rnPkg = path.join(root, 'node_modules', 'react-native', 'package.json');
  if (!fs.existsSync(rnPkg)) {
    return;
  }
  const version = JSON.parse(fs.readFileSync(rnPkg, 'utf8')).version;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'famheal-hermesc-'));
  try {
    execSync(`npm pack react-native@${version} --silent --pack-destination "${tmp}"`, {
      cwd: root,
      stdio: 'ignore',
    });
    const tgz = fs
      .readdirSync(tmp)
      .find(name => name.startsWith('react-native-') && name.endsWith('.tgz'));
    if (!tgz) {
      console.warn('[ensure-hermesc] react-native tarball not found');
      return;
    }
    fs.mkdirSync(destDir, { recursive: true });
    execSync(
      `tar -xzf "${path.join(tmp, tgz)}" -C "${destDir}" --strip-components=4 package/sdks/hermesc/${osBin}/${hermescName()}`,
      { stdio: 'ignore' },
    );
    if (!fs.existsSync(dest)) {
      console.warn('[ensure-hermesc] extract did not produce', dest);
      return;
    }
    fs.chmodSync(dest, 0o755);
    clearQuarantine(dest);
    console.log('[ensure-hermesc] restored', path.relative(root, dest));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

ensureHermesc();
