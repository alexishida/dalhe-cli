import assert from 'node:assert/strict';
import test from 'node:test';
import { RemoteSkillRepository } from '../src/services/RemoteSkillRepository.js';

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
