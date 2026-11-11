// Builds the "download all" ZIP of every weekend that has a `download` list in src/data/weekends.ts, into
// dist/downloads/. `npm run build` runs it after `vite build`.
//
// The ZIP holds one folder, named after the ZIP. In it, each item of the list, numbered in the list's order:
//   "<NN> <name>.pdf"            a deck
//   "<NN> <name>.html"           a visualization, its folder's index.html
//   "Handouts/<NN> <name>.pdf"   the handout of deck <NN>
// The scripts a visualization loads with <script src="x.js"></script> are written into its page, so that it is
// one file that opens from the participant's laptop. A visualization folder with any other file is copied as a
// folder, "<NN> <name>/", untouched.
//
// The files are read from public/, so the ZIP holds what the site serves. A missing file, or a name that cannot
// be a file name on Windows or macOS, stops the build with a message.
import { createServer } from 'vite';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const OUT = join(ROOT, 'dist', 'downloads');

// Reserved on Windows, or a trailing dot or space, which Windows drops.
const BAD_NAME = /[<>:"/\\|?*\u0000-\u001f]|[. ]$/;

class DownloadError extends Error {}

// weekends.ts is TypeScript and reads import.meta.env, so Vite loads it, as it does for the page.
async function loadWeekends() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  });
  try {
    return (await server.ssrLoadModule('/src/data/weekends.ts')).weekends;
  } finally {
    await server.close();
  }
}

// A deck() or viz() link is Vite's base followed by the file's path in public/.
function publicFile(url, what) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url === '#') {
    throw new DownloadError(`${what}: ${url} is no file of this site`);
  }
  const rel = url.replace(/^\.?\//, '');
  const path = join(PUBLIC, ...rel.split('/'));
  if (!existsSync(path)) throw new DownloadError(`${what}: public/${rel} does not exist`);
  return path;
}

// Every file under dir, as a path with "/", hidden files left out.
function listFiles(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => !d.name.startsWith('.'))
    .flatMap((d) =>
      d.isDirectory() ? listFiles(join(dir, d.name), `${prefix}${d.name}/`) : [`${prefix}${d.name}`],
    )
    .sort();
}

function visualization(indexPath, base) {
  const dir = dirname(indexPath);
  const files = listFiles(dir);
  const inlined = new Set(['index.html']);
  const html = readFileSync(indexPath, 'utf8').replace(
    /<script src="([\w.-]+\.js)"><\/script>/g,
    (tag, src) => {
      if (!files.includes(src)) return tag;
      const js = readFileSync(join(dir, src), 'utf8');
      // Either would end or change the inline script early.
      if (/<\/script|<!--/i.test(js)) return tag;
      inlined.add(src);
      return `<script>\n${js}\n</script>`;
    },
  );
  if (files.every((f) => inlined.has(f))) {
    return [{ name: `${base}.html`, data: Buffer.from(html, 'utf8') }];
  }
  return files.map((f) => ({ name: `${base}/${f}`, data: readFileSync(join(dir, ...f.split('/'))) }));
}

// The list's files, each folder announced once before its first file.
function withFolders(files) {
  const entries = [];
  const folders = new Set();
  for (const file of files) {
    const parts = file.name.split('/');
    for (let k = 1; k < parts.length; k++) {
      const folder = `${parts.slice(0, k).join('/')}/`;
      if (!folders.has(folder)) {
        folders.add(folder);
        entries.push({ name: folder });
      }
    }
    entries.push(file);
  }
  return entries;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// A ZIP archive (PKWARE APPNOTE 6.3): a local header and the data of each entry, then the central directory.
// Names are flagged as UTF-8; each file is deflated, or stored when deflating does not make it smaller.
function zip(entries, when) {
  const time = (when.getHours() << 11) | (when.getMinutes() << 5) | (when.getSeconds() >> 1);
  const date = ((when.getFullYear() - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate();
  const records = [];
  const directory = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const isFolder = name.endsWith('/');
    const nameBytes = Buffer.from(name, 'utf8');
    const raw = data ?? Buffer.alloc(0);
    const deflated = isFolder ? raw : deflateRawSync(raw, { level: 9 });
    const method = deflated.length < raw.length ? 8 : 0;
    const body = method === 8 ? deflated : raw;
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed: 2.0
    local.writeUInt16LE(0x0800, 6); // the name is UTF-8
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4); // made by: Unix, 2.0, so the modes below apply
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    // drwxr-xr-x plus the MS-DOS folder bit, or -rw-r--r--
    central.writeUInt32LE(isFolder ? ((0o40755 << 16) | 0x10) >>> 0 : (0o100644 << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);

    records.push(local, nameBytes, body);
    directory.push(central, nameBytes);
    offset += local.length + nameBytes.length + body.length;
  }
  const directoryBytes = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directoryBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...records, directoryBytes, end]);
}

function build(weekend, download, when) {
  const folder = download.file.replace(/\.zip$/, '');
  const width = Math.max(2, String(download.items.length).length);
  const steps = [];
  const handouts = [];
  download.items.forEach((item, i) => {
    const what = `Weekend ${weekend.number}, download item ${i + 1} (${item.name})`;
    if (BAD_NAME.test(item.name)) throw new DownloadError(`${what}: the name cannot be a file name`);
    const number = String(i + 1).padStart(width, '0');
    const base = `${folder}/${number} ${item.name}`;
    const path = publicFile(item.url, what);
    if (path.endsWith('.pdf')) steps.push({ name: `${base}.pdf`, data: readFileSync(path) });
    else if (path.endsWith('index.html')) steps.push(...visualization(path, base));
    else throw new DownloadError(`${what}: ${item.url} is neither a PDF nor a visualization`);
    if (item.handout) {
      const handout = publicFile(item.handout, `${what}, handout`);
      if (!handout.endsWith('.pdf')) throw new DownloadError(`${what}: the handout is no PDF`);
      handouts.push({ name: `${folder}/Handouts/${number} ${item.name}.pdf`, data: readFileSync(handout) });
    }
  });
  const entries = withFolders([...steps, ...handouts]);
  const archive = zip(entries, when);
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, download.file), archive);
  console.log(`downloads/${download.file}: ${download.items.length} items, ${(archive.length / 1e6).toFixed(1)} MB`);
  for (const e of entries) if (!e.name.endsWith('/')) console.log(`  ${e.name}`);
}

try {
  const weekends = await loadWeekends();
  const when = new Date();
  for (const weekend of weekends) if (weekend.download) build(weekend, weekend.download, when);
} catch (error) {
  if (!(error instanceof DownloadError)) throw error;
  console.error(`build-downloads: ${error.message}`);
  process.exit(1);
}
