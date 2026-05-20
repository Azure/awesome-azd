/**
 * Validate that every `source` URL in templates.json and agent-templates.json
 * resolves to a 2xx response. Designed to catch silent breakage when upstream
 * sample repos rename or remove files we reference.
 *
 * Output: writes broken-sources.md and exits non-zero if FAIL_ON_BROKEN=true
 * and any URL is non-2xx. Always appends a summary to $GITHUB_STEP_SUMMARY.
 */
const fs = require('fs');
const { validateUrl } = require('./url-validation');

const MANIFEST_FILES = [
  'website/static/templates.json',
  'website/static/agent-templates.json',
];

const CONCURRENCY = 8;
const TIMEOUT_MS = 15_000;
const RETRIES = 2;

const failOnBroken = (process.env.FAIL_ON_BROKEN || 'true').toLowerCase() === 'true';

async function probe(url) {
  validateUrl(url, 'template source'); // SSRF guard via shared util

  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      // HEAD first; fall back to GET if the host rejects HEAD.
      let res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' });
      if (res.status === 403 || res.status === 405) {
        res = await fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow' });
      }
      clearTimeout(timer);
      return { url, status: res.status, ok: res.ok };
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  return { url, status: 0, ok: false, error: String(lastErr) };
}

function collectSources() {
  const sources = [];
  for (const file of MANIFEST_FILES) {
    if (!fs.existsSync(file)) {
      console.log(`Skipping missing manifest: ${file}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const arr = Array.isArray(data) ? data : (data.templates || []);
    for (const entry of arr) {
      if (typeof entry?.source === 'string' && /^https?:\/\//i.test(entry.source)) {
        sources.push({
          file,
          id: entry.id,
          title: entry.title || entry.name || '(no title)',
          source: entry.source,
        });
      }
    }
  }
  return sources;
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return results;
}

(async () => {
  const sources = collectSources();
  console.log(`Probing ${sources.length} source URL(s) across ${MANIFEST_FILES.length} manifest(s)...`);

  const results = await runPool(
    sources,
    async (s) => ({ ...s, ...(await probe(s.source)) }),
    CONCURRENCY,
  );

  const broken = results.filter((r) => !r.ok);

  const lines = [];
  lines.push(`# Template Source URL Validation`);
  lines.push('');
  lines.push(`Checked **${results.length}** URLs. **${broken.length}** broken.`);
  if (broken.length) {
    lines.push('');
    lines.push('| Manifest | Title | Status | Source |');
    lines.push('|---|---|---|---|');
    for (const b of broken) {
      const status = b.status || b.error || 'unknown';
      lines.push(`| \`${b.file}\` | ${b.title} | ${status} | ${b.source} |`);
    }
  }
  const report = lines.join('\n') + '\n';
  fs.writeFileSync('broken-sources.md', report);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  }

  if (broken.length) {
    console.error(`\n${broken.length} broken source URL(s):`);
    for (const b of broken) {
      console.error(`  [${b.status || b.error}] ${b.source}`);
    }
    if (failOnBroken) process.exit(1);
  } else {
    console.log('All source URLs OK.');
  }
})().catch((err) => {
  console.error(err);
  process.exit(2);
});
