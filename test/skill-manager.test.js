import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { SkillManager } from '../src/services/SkillManager.js';
import { RemoteSkillRepository } from '../src/services/RemoteSkillRepository.js';
import { createGitHubFetch, COMMIT_SHA } from './helpers/github-fixture.js';

async function createSkillTemplate(rootDir, skillName, { references = {} } = {}) {
  const skillDir = join(rootDir, skillName);

  await mkdir(join(skillDir, 'references'), { recursive: true });
  await writeFile(
    join(skillDir, 'SKILL.md'),
    [
      '---',
      `name: ${skillName}`,
      `description: Use ${skillName}`,
      '---',
      '',
      `# ${skillName}`,
      '',
      'Read references when needed.',
      '',
    ].join('\n'),
  );

  for (const [relativePath, content] of Object.entries(references)) {
    const fullPath = join(skillDir, relativePath);
    const parentDir = relativePath.split('/').slice(0, -1);

    if (parentDir.length > 0) {
      await mkdir(join(skillDir, ...parentDir), { recursive: true });
    }

    await writeFile(fullPath, content);
  }
}

async function exists(path) {
  const info = await stat(path).catch((error) => {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  });

  return Boolean(info);
}

async function relativeFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await relativeFiles(rootDir, fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath.slice(rootDir.length + 1));
    }
  }

  return files.sort();
}

test('lists available skills with Codex and Claude install status', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-skill-list-'));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');

  try {
    await mkdir(templateRootDir, { recursive: true });
    await writeFile(join(templateRootDir, '.keep'), '');
    await createSkillTemplate(templateRootDir, 'rails8');
    await createSkillTemplate(templateRootDir, 'react');

    await mkdir(join(codexHomeDir, 'skills', 'rails8'), { recursive: true });
    await mkdir(join(userHomeDir, '.claude', 'skills', 'react'), { recursive: true });
    await writeFile(join(userHomeDir, '.claude', 'skills', 'react', 'SKILL.md'), '# react');

    const skills = await new SkillManager({
      templateRootDir,
      env: { CODEX_HOME: codexHomeDir },
      userHomeDir,
    }).list();

    assert.deepEqual(skills.map((skill) => skill.name), ['rails8', 'react']);
    assert.equal(skills[0].codex.installed, true);
    assert.equal(skills[0].claude.installed, false);
    assert.equal(skills[1].codex.installed, false);
    assert.equal(skills[1].claude.installed, true);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('installs skill globally for Codex and Claude Code', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-skill-install-'));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');

  try {
    await mkdir(templateRootDir, { recursive: true });
    await createSkillTemplate(templateRootDir, 'rails8', {
      references: {
        'references/guide.md': '# Guide\n\nUse this guide.\n',
        'references/checklist.md': '# Checklist\n\n- first\n',
      },
    });

    const manager = new SkillManager({
      templateRootDir,
      env: { CODEX_HOME: codexHomeDir },
      userHomeDir,
    });

    const result = await manager.install('rails8');
    const codexSkillDir = join(codexHomeDir, 'skills', 'rails8');
    const claudeSkillDir = join(userHomeDir, '.claude', 'skills', 'rails8');
    const claudeCommandFile = join(userHomeDir, '.claude', 'commands', 'rails8.md');

    assert.equal(result.claudeDir, claudeSkillDir);
    assert.equal(result.claudeCommandFile, claudeCommandFile);
    assert.equal(await exists(join(codexSkillDir, 'SKILL.md')), true);
    assert.equal(await exists(join(codexSkillDir, 'references', 'guide.md')), true);
    assert.equal(await exists(join(claudeSkillDir, 'SKILL.md')), true);
    assert.equal(await exists(join(claudeSkillDir, 'references', 'guide.md')), true);
    assert.equal(
      await readFile(join(claudeSkillDir, 'references', 'guide.md'), 'utf8'),
      '# Guide\n\nUse this guide.\n',
    );
    assert.equal(await exists(claudeCommandFile), true);
    assert.equal(
      await readFile(claudeCommandFile, 'utf8'),
      'Invoke the `rails8` skill. $ARGUMENTS\n',
    );
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('installs a requested skill from GitHub instead of bundled templates', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-remote-skill-install-'));
  t.after(() => rm(workspace, { force: true, recursive: true }));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');
  await mkdir(templateRootDir, { recursive: true });
  await createSkillTemplate(templateRootDir, 'dl-example');

  const manager = new SkillManager({
    templateRootDir,
    env: { CODEX_HOME: codexHomeDir },
    userHomeDir,
    remoteSkillRepository: new RemoteSkillRepository({
      repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
      fetchImpl: createGitHubFetch({
        'dl-example/SKILL.md': '# Remote skill\n',
        'dl-example/references/guide.md': '# Remote guide\n',
      }),
    }),
  });

  const result = await manager.install('dl-example');

  assert.equal(result.commit, COMMIT_SHA);
  assert.equal(await readFile(join(codexHomeDir, 'skills', 'dl-example', 'SKILL.md'), 'utf8'), '# Remote skill\n');
  assert.equal(await readFile(join(userHomeDir, '.claude', 'skills', 'dl-example', 'references', 'guide.md'), 'utf8'), '# Remote guide\n');
});

test('installs every bundled portable skill in the default Codex and Claude paths', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-portable-skills-'));
  t.after(() => rm(workspace, { force: true, recursive: true }));
  const templateRootDir = join(process.cwd(), 'src', 'template', 'skills');
  const userHomeDir = join(workspace, 'home');
  const manager = new SkillManager({ templateRootDir, userHomeDir, env: {} });
  const bundledSkills = await manager.list({ includeStatus: false });

  const result = await manager.installAll();
  assert.equal(result.totalInstalled, bundledSkills.length);

  for (const { name, sourceDir } of bundledSkills) {
    const sourceSkill = await readFile(join(sourceDir, 'SKILL.md'), 'utf8');
    const frontmatter = sourceSkill.match(/^---\n([\s\S]*?)\n---/);
    assert.ok(frontmatter, `${name} must have frontmatter`);
    assert.match(frontmatter[1], new RegExp(`^name: ${name}$`, 'm'));
    assert.match(frontmatter[1], /^description:/m);
    assert.doesNotMatch(frontmatter[1], /^(?:user-invocable|disable-model-invocation|allowed-tools):/m);

    const codexDir = join(userHomeDir, '.agents', 'skills', name);
    const claudeDir = join(userHomeDir, '.claude', 'skills', name);
    assert.equal(await exists(join(codexDir, 'SKILL.md')), true);
    assert.equal(await exists(join(claudeDir, 'SKILL.md')), true);
    assert.deepEqual(await relativeFiles(codexDir), await relativeFiles(sourceDir));
    assert.deepEqual(await relativeFiles(claudeDir), await relativeFiles(sourceDir));
  }
});

test('installs all skills globally for Codex and Claude Code', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-skill-install-all-'));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');

  try {
    await mkdir(templateRootDir, { recursive: true });
    await createSkillTemplate(templateRootDir, 'nodejs-dev', {
      references: {
        'references/guide.md': '# Node guide\n',
      },
    });
    await createSkillTemplate(templateRootDir, 'pure-ruby', {
      references: {
        'references/guide.md': '# Ruby guide\n',
      },
    });

    const manager = new SkillManager({
      templateRootDir,
      env: { CODEX_HOME: codexHomeDir },
      userHomeDir,
    });

    const result = await manager.installAll();

    assert.equal(result.totalInstalled, 2);
    assert.deepEqual(
      result.installedSkills.map((skill) => skill.name),
      ['nodejs-dev', 'pure-ruby'],
    );
    assert.equal(await exists(join(codexHomeDir, 'skills', 'nodejs-dev', 'SKILL.md')), true);
    assert.equal(await exists(join(codexHomeDir, 'skills', 'pure-ruby', 'SKILL.md')), true);
    assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'nodejs-dev', 'SKILL.md')), true);
    assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'pure-ruby', 'SKILL.md')), true);
    assert.equal(await exists(join(userHomeDir, '.claude', 'commands', 'nodejs-dev.md')), true);
    assert.equal(await exists(join(userHomeDir, '.claude', 'commands', 'pure-ruby.md')), true);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('installs every skill from GitHub, including skills absent from bundled templates', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-remote-skill-install-all-'));
  t.after(() => rm(workspace, { force: true, recursive: true }));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');
  await mkdir(templateRootDir, { recursive: true });
  await createSkillTemplate(templateRootDir, 'bundled-only');

  const manager = new SkillManager({
    templateRootDir,
    env: { CODEX_HOME: codexHomeDir },
    userHomeDir,
    remoteSkillRepository: new RemoteSkillRepository({
      repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
      fetchImpl: createGitHubFetch({
        'dl-existing/SKILL.md': '# Existing remote skill\n',
        'dl-new/SKILL.md': '# New remote skill\n',
        'dl-new/references/guide.md': '# Guide\n',
      }),
    }),
  });

  const result = await manager.installAll();

  assert.equal(result.totalInstalled, 2);
  assert.deepEqual(result.installedSkills.map((skill) => skill.name), ['dl-existing', 'dl-new']);
  assert.equal(await exists(join(codexHomeDir, 'skills', 'dl-existing', 'SKILL.md')), true);
  assert.equal(await exists(join(codexHomeDir, 'skills', 'dl-new', 'references', 'guide.md')), true);
  assert.equal(await exists(join(codexHomeDir, 'skills', 'bundled-only')), false);
  assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'dl-new', 'SKILL.md')), true);
});

test('uninstalls skill globally from Codex and Claude Code', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-skill-uninstall-'));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');

  try {
    await mkdir(templateRootDir, { recursive: true });
    await createSkillTemplate(templateRootDir, 'rails8');

    const manager = new SkillManager({
      templateRootDir,
      env: { CODEX_HOME: codexHomeDir },
      userHomeDir,
    });

    await manager.install('rails8');

    const firstRemoval = await manager.uninstall('rails8');

    assert.equal(firstRemoval.removedFromCodex, true);
    assert.equal(firstRemoval.removedFromClaude, true);
    assert.equal(firstRemoval.removedCommand, true);
    assert.equal(await exists(join(codexHomeDir, 'skills', 'rails8')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'rails8')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'commands', 'rails8.md')), false);
    await assert.rejects(() => manager.uninstall('rails8'), { code: 'SKILL_NOT_INSTALLED' });
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('uninstalls a skill installed from GitHub after it leaves bundled templates', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-remote-skill-uninstall-'));
  t.after(() => rm(workspace, { force: true, recursive: true }));
  const codexHomeDir = join(workspace, 'codex-home');
  const remoteSkillDir = join(codexHomeDir, 'skills', 'dl-remote-only');
  await mkdir(remoteSkillDir, { recursive: true });
  await writeFile(join(remoteSkillDir, 'SKILL.md'), '# Remote only\n');

  const manager = new SkillManager({
    templateRootDir: join(workspace, 'templates'),
    env: { CODEX_HOME: codexHomeDir },
    userHomeDir: join(workspace, 'home'),
  });

  const result = await manager.uninstall('dl-remote-only');

  assert.equal(result.removedFromCodex, true);
  assert.equal(await exists(remoteSkillDir), false);
});

test('uninstalls all skills globally from Codex and Claude Code', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-skill-uninstall-all-'));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');

  try {
    await mkdir(templateRootDir, { recursive: true });
    await createSkillTemplate(templateRootDir, 'nodejs-dev');
    await createSkillTemplate(templateRootDir, 'pure-ruby');

    const manager = new SkillManager({
      templateRootDir,
      env: { CODEX_HOME: codexHomeDir },
      userHomeDir,
    });

    await manager.installAll();

    const result = await manager.uninstallAll();

    assert.equal(result.totalUninstalled, 2);
    assert.deepEqual(
      result.removedSkills.map((skill) => skill.name),
      ['nodejs-dev', 'pure-ruby'],
    );
    assert.equal(await exists(join(codexHomeDir, 'skills', 'nodejs-dev')), false);
    assert.equal(await exists(join(codexHomeDir, 'skills', 'pure-ruby')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'nodejs-dev')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'pure-ruby')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'commands', 'nodejs-dev.md')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'commands', 'pure-ruby.md')), false);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('updates all installed skills from GitHub instead of local templates', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-skill-update-all-'));
  const templateRootDir = join(workspace, 'templates');
  const userHomeDir = join(workspace, 'home');
  const codexHomeDir = join(workspace, 'codex-home');

  try {
    await mkdir(templateRootDir, { recursive: true });
    await createSkillTemplate(templateRootDir, 'rails8', {
      references: {
        'references/guide.md': '# Guia novo\n',
      },
    });
    await createSkillTemplate(templateRootDir, 'react', {
      references: {
        'references/guide.md': '# React novo\n',
      },
    });

    const manager = new SkillManager({
      templateRootDir,
      env: { CODEX_HOME: codexHomeDir },
      userHomeDir,
      remoteSkillRepository: new RemoteSkillRepository({
        repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
        fetchImpl: createGitHubFetch({
          'rails8/SKILL.md': '# Rails remoto',
          'rails8/references/guide.md': '# Guia remoto\n',
          'react/SKILL.md': '# React remoto',
          'react/references/guide.md': '# React remoto\n',
          'not-installed/SKILL.md': '# Do not install',
        }),
      }),
    });

    await manager.install('rails8');
    await mkdir(join(userHomeDir, '.claude', 'skills', 'react'), { recursive: true });
    await writeFile(join(userHomeDir, '.claude', 'skills', 'react', 'SKILL.md'), '# react antigo\n');
    await writeFile(join(userHomeDir, '.claude', 'commands', 'react.md'), 'Invoke the `react` skill. antigo\n');
    await writeFile(join(codexHomeDir, 'skills', 'rails8', 'references', 'guide.md'), '# Guia antigo\n');

    const result = await manager.updateAll();

    assert.equal(result.totalUpdated, 2);
    assert.deepEqual(
      result.updatedSkills.map((skill) => skill.name),
      ['rails8', 'react'],
    );
    assert.equal(
      await readFile(join(codexHomeDir, 'skills', 'rails8', 'references', 'guide.md'), 'utf8'),
      '# Guia remoto\n',
    );
    assert.equal(
      await readFile(join(userHomeDir, '.claude', 'skills', 'react', 'references', 'guide.md'), 'utf8'),
      '# React remoto\n',
    );
    assert.equal(
      await readFile(join(userHomeDir, '.claude', 'commands', 'react.md'), 'utf8'),
      'Invoke the `react` skill. $ARGUMENTS\n',
    );
    assert.equal(await exists(join(codexHomeDir, 'skills', 'not-installed')), false);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('rejects path traversal before installing or removing a skill', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-skill-path-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const templateRootDir = join(workspace, 'templates');
  await mkdir(templateRootDir);
  await createSkillTemplate(workspace, 'outside');
  const manager = new SkillManager({ templateRootDir, userHomeDir: join(workspace, 'home'), env: {} });

  for (const name of ['../outside', '.', '..', 'nested/skill', 'nested\\skill', 'C:skill']) {
    for (const operation of ['install', 'uninstall', 'update']) {
      await assert.rejects(() => manager[operation](name), { code: 'INVALID_SKILL_NAME' });
    }
  }
  assert.equal(await exists(join(workspace, 'outside', 'SKILL.md')), true);
});

for (const method of ['update', 'updateAll']) {
  test(`${method} updates installed skills absent from bundled templates`, async (t) => {
    const workspace = await mkdtemp(join(tmpdir(), 'dalhe-remote-update-'));
    t.after(() => rm(workspace, { recursive: true, force: true }));
    const codexHome = join(workspace, 'codex');
    const installedDir = join(codexHome, 'skills', 'dl-new');
    await mkdir(installedDir, { recursive: true });
    await writeFile(join(installedDir, 'SKILL.md'), '# Old');
    await writeFile(join(installedDir, 'obsolete.md'), 'remove me');
    const manager = new SkillManager({
      templateRootDir: join(workspace, 'missing-templates'),
      userHomeDir: workspace,
      env: { CODEX_HOME: codexHome },
      remoteSkillRepository: new RemoteSkillRepository({
        repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
        fetchImpl: createGitHubFetch({ 'dl-new/SKILL.md': '# New from GitHub' }),
      }),
    });
    const result = await manager[method]('dl-new');
    assert.equal((method === 'update' ? result : result.updatedSkills[0]).commit, COMMIT_SHA);
    assert.equal(await readFile(join(installedDir, 'SKILL.md'), 'utf8'), '# New from GitHub');
    assert.equal(await exists(join(installedDir, 'obsolete.md')), false);
    assert.equal(await readFile(join(workspace, '.claude', 'skills', 'dl-new', 'SKILL.md'), 'utf8'), '# New from GitHub');
  });
}

test('a failed bulk download preserves every installed skill and removes temporary files', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-remote-failure-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const codexHome = join(workspace, 'codex');
  for (const name of ['dl-first', 'dl-second']) {
    const dir = join(codexHome, 'skills', name);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'SKILL.md'), '# Old');
  }
  const repository = new RemoteSkillRepository({
    repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
    fetchImpl: createGitHubFetch({
      'dl-first/SKILL.md': '# New',
      'dl-second/SKILL.md': '# New',
    }, { failPath: 'dl-second/SKILL.md' }),
  });
  const destinations = [];
  const download = repository.download.bind(repository);
  repository.download = (input) => {
    destinations.push(input.targetDir);
    return download(input);
  };
  const manager = new SkillManager({
    templateRootDir: workspace, userHomeDir: workspace,
    env: { CODEX_HOME: codexHome }, remoteSkillRepository: repository,
  });
  await assert.rejects(() => manager.updateAll(), { code: 'REMOTE_FETCH_FAILED' });
  for (const name of ['dl-first', 'dl-second']) {
    assert.equal(await readFile(join(codexHome, 'skills', name, 'SKILL.md'), 'utf8'), '# Old');
  }
  for (const destination of destinations) assert.equal(await exists(destination), false);
});

test('single update rejects an uninstalled skill without contacting GitHub', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-not-installed-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const manager = new SkillManager({
    templateRootDir: workspace, userHomeDir: workspace, env: {},
    remoteSkillRepository: { snapshot() { assert.fail('must not fetch'); } },
  });
  await assert.rejects(() => manager.update('dl-missing'), { code: 'SKILL_NOT_INSTALLED' });
});

test('skills absent from GitHub are preserved and cannot be updated individually', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-removed-remote-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const skillDir = join(workspace, '.agents', 'skills', 'dl-removed');
  await mkdir(skillDir, { recursive: true });
  await writeFile(join(skillDir, 'SKILL.md'), '# Existing');
  const manager = new SkillManager({
    templateRootDir: workspace, userHomeDir: workspace, env: {},
    remoteSkillRepository: new RemoteSkillRepository({
      repositoryUrl: 'https://github.com/alexishida/dalhe-cli.git',
      fetchImpl: createGitHubFetch({ 'dl-other/SKILL.md': '# Uninstalled' }),
    }),
  });
  await assert.rejects(() => manager.update('dl-removed'), { code: 'REMOTE_SKILL_NOT_FOUND' });
  assert.deepEqual(await manager.updateAll(), { totalUpdated: 0, updatedSkills: [] });
  assert.equal(await readFile(join(skillDir, 'SKILL.md'), 'utf8'), '# Existing');
});

test('ignores directories named SKILL.md and rejects their installation', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-skill-invalid-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const templateRootDir = join(workspace, 'templates');
  await mkdir(join(templateRootDir, 'invalid', 'SKILL.md'), { recursive: true });
  const manager = new SkillManager({ templateRootDir, userHomeDir: workspace, env: {} });
  assert.deepEqual(await manager.list(), []);
  await assert.rejects(() => manager.install('invalid'), { code: 'INVALID_SKILL_TEMPLATE' });
});

test('can list templates without accessing global installation paths', async (t) => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-skill-catalog-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const templateRootDir = join(workspace, 'templates');
  await createSkillTemplate(templateRootDir, 'example');
  const blockedHome = join(workspace, 'not-a-directory');
  await writeFile(blockedHome, 'file');
  const manager = new SkillManager({ templateRootDir, userHomeDir: blockedHome, env: {} });
  assert.deepEqual(await manager.list({ includeStatus: false }), [
    { name: 'example', sourceDir: join(templateRootDir, 'example') },
  ]);
});
