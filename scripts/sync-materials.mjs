// Keeps the weekend pages in step with their agendas and with public/. `npm run dev` and `npm run build` run it
// first (package.json), so every deploy runs it. Run it alone with `node scripts/sync-materials.mjs`. It
//
//   1. writes src/data/generated/notebooks-in-games.json: for each weekend, the notebook files that the games linked
//      on its page name, in a link or in their code. The page leaves every link to those notebooks off
//      (src/lib/materials.ts); the participants open them from the games;
//   2. checks each weekend that has a `download` (src/data/weekends.ts) against public/, and stops with the list of
//      what disagrees (check() below);
//   3. writes that weekend's ZIP, public/downloads/<file>: one folder named after the ZIP, in it the decks and
//      visualizations of the agenda, numbered and named as on the page, "<NN> <name>.pdf" and "<NN> <name>.html",
//      and "Handouts/<NN> <name> (handout).pdf". The scripts a visualization loads with
//      <script src="x.js"></script> are written into its page, so that it is one file that opens from the
//      participant's laptop; a visualization folder with any other file goes in as a folder, "<NN> <name>/".
//
// Nothing it writes is committed (.gitignore).
import { createServer } from 'vite';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const DOWNLOADS = join(PUBLIC, 'downloads');
const NOTEBOOKS_JSON = join(ROOT, 'src', 'data', 'generated', 'notebooks-in-games.json');

// Reserved on Windows, or a trailing dot or space, which Windows drops.
const BAD_NAME = /[<>:"/\\|?*\u0000-\u001f]|[. ]$/;
// Chip labels of the older style, which say what a link is and not which material: no name for a file.
const GENERIC = /^(slides?|deck|pdf|handout|annotated( copy)?|cold intro( handout)?|game|visuali[sz]ation)$/i;
// The files of a game in which a notebook can be named.
const TEXT_FILE = /\.(html?|m?js|json)$/i;
const NOTEBOOK = /[A-Za-z0-9_.-]+\.ipynb/g;

// A deck() or viz() link is Vite's base, "/" here, followed by the file's path in public/.
const rel = (url) => url.replace(/^\.?\//, '');
const inPublic = (url) => join(PUBLIC, ...rel(url).split('/'));

// Every file under dir, as a path with "/", hidden files left out.
function listFiles(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => !d.name.startsWith('.'))
    .flatMap((d) =>
      d.isDirectory() ? listFiles(join(dir, d.name), `${prefix}${d.name}/`) : [`${prefix}${d.name}`],
    )
    .sort();
}

// weekends.ts and materials.ts are TypeScript and read import.meta.env, so Vite loads them, as it does for the page.
async function withModules(task) {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  });
  try {
    return await task((path) => server.ssrLoadModule(path));
  } finally {
    await server.close();
  }
}

// 1. For each weekend, the notebooks that the games linked on its page name.
function notebooksInGames(weekends, lib) {
  const result = {};
  for (const weekend of weekends) {
    const links = [...lib.agendaLinks(weekend), ...weekend.resources];
    const games = [...new Set(links.map((l) => l.url).filter(lib.isViz))];
    const names = new Set();
    for (const game of games) {
      const dir = dirname(inPublic(game));
      if (!existsSync(dir)) continue; // check() reports it
      for (const file of listFiles(dir).filter((f) => TEXT_FILE.test(f))) {
        for (const name of readFileSync(join(dir, ...file.split('/')), 'utf8').match(NOTEBOOK) ?? []) names.add(name);
      }
    }
    result[weekend.id] = [...names].sort();
  }
  return result;
}

function writeIfChanged(path, text) {
  if (existsSync(path) && readFileSync(path, 'utf8') === text) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

// 2. What disagrees between a weekend with a `download`, its agenda and public/, one message per problem.
function check(weekend, lib) {
  const where = `Weekend ${weekend.number}`;
  const download = weekend.download;
  const problems = [];
  const say = (text) => problems.push(`${where}: ${text}`);

  if (!/\.zip$/.test(download.file) || BAD_NAME.test(download.file)) {
    say(`download.file "${download.file}" must be a file name that ends in .zip`);
  }

  // The rows' order numbers the materials, so each day's rows go by time.
  for (const [day, rows] of [['Friday', weekend.friday], ['Saturday', weekend.saturday]]) {
    let last = null;
    for (const row of rows) {
      const time = row.time.match(/^(\d{1,2}):(\d\d)/);
      if (!time) continue;
      const minutes = Number(time[1]) * 60 + Number(time[2]);
      if (last && minutes < last.minutes) {
        say(`${day}, the row "${row.title}" at ${row.time} comes after the row "${last.title}" at ${last.time}; order the rows by time`);
      }
      if (!last || minutes > last.minutes) last = { minutes, time: row.time, title: row.title };
    }
  }

  // Each numbered material: a label that names it and can be a file name, and its file in public/.
  const materials = lib.numberedMaterials(weekend);
  const linked = new Set();
  for (const m of materials) {
    linked.add(rel(m.url));
    if (!m.name.trim() || BAD_NAME.test(m.name)) {
      say(`the label "${m.name}" of ${m.url} cannot be a file name (no < > : " / \\ | ? *, no dot or space at the end); change the label`);
    } else if (GENERIC.test(m.name.trim())) {
      say(`the label "${m.name}" of ${m.url} does not name the material, and it is the name of its file, "${m.fileName}"; name the material, for example "Large-scale computing, cold intro"`);
    }
    if (!existsSync(inPublic(m.url))) say(`"${m.name}" links ${m.url}, and public/${rel(m.url)} does not exist`);
    if (m.handout) {
      linked.add(rel(m.handout.url));
      if (!existsSync(inPublic(m.handout.url))) {
        say(`the handout of "${m.name}" links ${m.handout.url}, and public/${rel(m.handout.url)} does not exist`);
      }
    }
  }

  // A handout takes its deck's number, so it is linked after its deck.
  for (const link of lib.agendaLinks(weekend)) {
    const deck = lib.isLocalMaterial(link.url) ? lib.deckOfHandout(link.url) : null;
    if (deck && !linked.has(rel(link.url))) {
      say(`the handout ${link.url} is not linked after its deck ${deck}; link it right after the deck, on the same row`);
    }
  }

  // Extras: files of this site, kept off the agenda on purpose.
  const extras = new Set((download.extras ?? []).map(rel));
  for (const url of download.extras ?? []) {
    if (!lib.isLocalMaterial(url)) say(`download.extras lists ${url}, which is no deck or visualization of this site`);
    else if (!existsSync(inPublic(url))) say(`download.extras lists ${url}, and public/${rel(url)} does not exist; remove it`);
    if (linked.has(rel(url))) say(`${url} is on the agenda and in download.extras; remove it from download.extras`);
  }

  // The Materials list links no deck or visualization that the agenda leaves out, unless it is an extra.
  for (const r of weekend.resources) {
    if (lib.isLocalMaterial(r.url) && !linked.has(rel(r.url)) && !extras.has(rel(r.url))) {
      say(`the Materials list links "${r.label}", ${r.url}, which is on no row of the agenda; link it on the agenda at its place, or add it to download.extras`);
    }
  }

  // Every file in public/slides/we<N>/ and every visualization in public/viz/we<N>/ is on the agenda or an extra.
  const n = weekend.number;
  const onSite = [];
  if (existsSync(join(PUBLIC, 'slides', `we${n}`))) {
    for (const f of listFiles(join(PUBLIC, 'slides', `we${n}`))) onSite.push({ url: `slides/we${n}/${f}`, shown: `public/slides/we${n}/${f}` });
  }
  if (existsSync(join(PUBLIC, 'viz', `we${n}`))) {
    for (const d of readdirSync(join(PUBLIC, 'viz', `we${n}`), { withFileTypes: true })) {
      if (d.isDirectory() && !d.name.startsWith('.')) {
        onSite.push({ url: `viz/we${n}/${d.name}/index.html`, shown: `public/viz/we${n}/${d.name}/` });
      }
    }
  }
  for (const file of onSite) {
    if (!linked.has(file.url) && !extras.has(file.url)) {
      say(`${file.shown} is on no row of the agenda; link it at its place in src/data/weekends.ts, add it to download.extras to keep it off the agenda, or delete it`);
    }
  }
  return problems;
}

// 3. The ZIP.
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

// The files, each folder announced once before its first file.
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

function writeZip(weekend, materials, when) {
  const folder = weekend.download.file.replace(/\.zip$/, '');
  const steps = [];
  const handouts = [];
  for (const m of materials) {
    if (m.kind === 'pdf') steps.push({ name: `${folder}/${m.fileName}`, data: readFileSync(inPublic(m.url)) });
    else steps.push(...visualization(inPublic(m.url), `${folder}/${m.tag} ${m.name}`));
    if (m.handout) handouts.push({ name: `${folder}/Handouts/${m.handout.fileName}`, data: readFileSync(inPublic(m.handout.url)) });
  }
  const entries = withFolders([...steps, ...handouts]);
  const archive = zip(entries, when);
  mkdirSync(DOWNLOADS, { recursive: true });
  writeFileSync(join(DOWNLOADS, weekend.download.file), archive);
  console.log(
    `downloads/${weekend.download.file}: ${materials.length} numbered, ${handouts.length} handouts, ${(archive.length / 1e6).toFixed(1)} MB`,
  );
  for (const e of entries) if (!e.name.endsWith('/')) console.log(`  ${e.name}`);
}

const problems = await withModules(async (load) => {
  const { weekends } = await load('/src/data/weekends.ts');
  // materials.ts imports the file that step 1 writes; a placeholder lets it load on a fresh clone.
  if (!existsSync(NOTEBOOKS_JSON)) writeIfChanged(NOTEBOOKS_JSON, '{}\n');
  const lib = await load('/src/lib/materials.ts');

  const notebooks = notebooksInGames(weekends, lib);
  writeIfChanged(NOTEBOOKS_JSON, `${JSON.stringify(notebooks, null, 2)}\n`);
  for (const [id, names] of Object.entries(notebooks)) {
    if (names.length) console.log(`${id}: the games open ${names.length} notebooks, left off the page`);
  }

  // Old ZIPs go, so that a renamed or removed download is not served any more.
  if (existsSync(DOWNLOADS)) {
    for (const f of readdirSync(DOWNLOADS)) if (f.endsWith('.zip')) rmSync(join(DOWNLOADS, f));
  }
  const found = [];
  const when = new Date();
  for (const weekend of weekends.filter((w) => w.download)) {
    const own = check(weekend, lib);
    found.push(...own);
    if (own.length === 0) writeZip(weekend, lib.numberedMaterials(weekend), when);
  }
  return found;
});

if (problems.length) {
  console.error(`sync-materials: the agenda and public/ disagree (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('The numbering, the file names and the ZIP come from the agenda; see README.md, "Numbered materials".');
  process.exit(1);
}
