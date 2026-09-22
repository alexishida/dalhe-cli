import assert from 'node:assert/strict';
import test from 'node:test';
import { RemoteSkillRepository } from '../src/services/RemoteSkillRepository.js';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createGitHubFetch, COMMIT_SHA } from './helpers/github-fixture.js';

function createRepository({ repositoryUrl, fetchImpl, env = {} }) {
  return new RemoteSkillRepository({ repositoryUrl, fetchImpl, env });
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
  };
}

test('fetches skills from the repository contents API', async () => {
  let requestedUrl;
  const repository = createRepository({
    repositoryUrl: 'git+https://github.com/alexishida/dalhe-cli.git',
    async fetchImpl(url) {
      requestedUrl = url;
      return jsonResponse(200, [
        { name: 'dl-code-review', type: 'dir' },
        { name: 'dl-rails-8', type: 'dir' },
        { name: 'SKILL.md', type: 'file' },
        { name: '.hidden-skill', type: 'dir' },
        { name: 'dl-nodejs-dev', type: 'dir' },
      ]);
    },
  });

  const skills = await repository.list();

  assert.equal(
    requestedUrl,
    'https://api.github.com/repos/alexishida/dalhe-cli/contents/src/template/skills',
  );
  assert.deepEqual(
    skills.map((skill) => skill.name),
    ['dl-code-review', 'dl-nodejs-dev', 'dl-rails-8'],
  );
});

test('throws when repository URL is not configured', async () => {
  const repository = createRepository({
    repositoryUrl: null,
    async fetchImpl() {
      throw new Error('should not be called');
    },
  });

  await assert.rejects(
    () => repository.list(),
    (error) => error.code === 'MISSING_REPOSITORY_URL',
  );
});

test('throws when repository URL does not point to GitHub', async () => {
  const repository = createRepository({
    repositoryUrl: 'git+https://example.com/other/repo.git',
    async fetchImpl() {
      throw new Error('should not be called');
    },
  });

  await assert.rejects(
    () => repository.list(),
    (error) => error.code === 'MISSING_REPOSITORY_URL',
  );
});

test('throws a CLI error when the fetch fails', async () => {
  const repository = createRepository({
    repositoryUrl: 'git+https://github.com/alexishida/dalhe-cli.git',
    async fetchImpl() {
      throw new Error('network down');
    },
  });

  await assert.rejects(
    () => repository.list(),
    (error) => error.code === 'REMOTE_FETCH_FAILED' && /network down/.test(error.message),
  );
});

test('throws a CLI error on non-ok HTTP response', async () => {
  const repository = createRepository({
    repositoryUrl: 'git+https://github.com/alexishida/dalhe-cli.git',
    async fetchImpl() {
      return jsonResponse(403, { message: 'rate limit' });
    },
  });

  await assert.rejects(
    () => repository.list(),
    (error) => error.code === 'REMOTE_FETCH_FAILED' && /HTTP 403/.test(error.message),
  );
});

test('skips remote listing when disabled by env', async () => {
  const repository = createRepository({
    repositoryUrl: 'git+https://github.com/alexishida/dalhe-cli.git',
    env: { DALHE_CLI_SKIP_REMOTE_SKILL_LIST: '1' },
    async fetchImpl() {
      throw new Error('should not be called');
    },
  });

  await assert.rejects(
    () => repository.list(),
    (error) => error.code === 'REMOTE_FETCH_FAILED',
  );
});

for (const phase of ['headers', 'body']) {
  test(`times out while waiting for response ${phase}`, async () => {
    let requestSignal;
    const repository = new RemoteSkillRepository({
      repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
      env: {},
      timeoutMs: 20,
      async fetchImpl(url, { signal } = {}) {
        requestSignal = signal;
        const waitForAbort = () => new Promise((resolve, reject) => {
          signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
        });
        return phase === 'headers' ? waitForAbort() : { ok: true, json: waitForAbort };
      },
    });
    await assert.rejects(() => repository.list(), { code: 'REMOTE_FETCH_FAILED' });
    assert.equal(requestSignal.aborted, true);
  });
}

test('reports malformed API data as a remote fetch failure', async () => {
  for (const body of [{ message: 'invalid' }, [null], [{ type: 'dir' }]]) {
    const repository = createRepository({
      repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
      fetchImpl: async () => jsonResponse(200, body),
    });
    await assert.rejects(() => repository.list(), { code: 'REMOTE_FETCH_FAILED' });
  }
});

test('downloads nested files, binary assets and scripts from one pinned commit', async (t) => {
  const targetDir = await mkdtemp(join(tmpdir(), 'dalhe-download-'));
  t.after(() => rm(targetDir, { recursive: true, force: true }));
  const calls = [];
  const repository = createRepository({
    repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
    env: { DALHE_CLI_SKIP_REMOTE_SKILL_LIST: '1' },
    fetchImpl: createGitHubFetch({
      'dl-example/SKILL.md': '# Remote',
      'dl-example/references/a guide.md': 'reference',
      'dl-example/assets/image.bin': new Uint8Array([0, 255, 128]),
      'dl-example/scripts/run.sh': '#!/bin/sh\necho hello\n',
    }, { calls }),
  });
  const snapshot = await repository.snapshot();
  await repository.download({ snapshot, skill: snapshot.skills[0], targetDir });
  assert.equal(snapshot.commit, COMMIT_SHA);
  assert.equal(await readFile(join(targetDir, 'references', 'a guide.md'), 'utf8'), 'reference');
  assert.deepEqual(await readFile(join(targetDir, 'assets', 'image.bin')), Buffer.from([0, 255, 128]));
  if (process.platform !== 'win32') assert.equal((await stat(join(targetDir, 'scripts', 'run.sh'))).mode & 0o111, 0o111);
  assert.equal(calls.length, 6);
  assert.ok(calls.slice(2).every((url) => url.includes(`/${COMMIT_SHA}/`)));
});

for (const invalid of [
  { path: '../escape', type: 'blob', mode: '100644' },
  { path: 'nested/../../escape', type: 'blob', mode: '100644' },
  { path: 'C:escape', type: 'blob', mode: '100644' },
  { path: 'nested\\escape', type: 'blob', mode: '100644' },
  { path: 'link', type: 'blob', mode: '120000' },
  { path: 'submodule', type: 'commit', mode: '160000' },
]) {
  test(`rejects unsafe remote entry ${invalid.path} (${invalid.mode}) before downloading`, async () => {
    const repository = createRepository({
      repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
      fetchImpl: () => assert.fail('must not fetch unsafe files'),
    });
    await assert.rejects(() => repository.download({
      snapshot: {}, skill: { name: 'dl-example', files: [invalid] }, targetDir: '/unused',
    }), { code: 'INVALID_SKILL_TEMPLATE' });
  });
}

test('rejects truncated trees instead of installing incomplete skills', async () => {
  const repository = createRepository({
    repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
    fetchImpl: createGitHubFetch({}, { truncated: true }),
  });
  await assert.rejects(() => repository.snapshot(), { code: 'REMOTE_FETCH_FAILED' });
});
