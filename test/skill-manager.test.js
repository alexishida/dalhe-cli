import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { SkillManager } from '../src/services/SkillManager.js';

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
    const secondRemoval = await manager.uninstall('rails8');

    assert.equal(firstRemoval.removedFromCodex, true);
    assert.equal(firstRemoval.removedFromClaude, true);
    assert.equal(firstRemoval.removedCommand, true);
    assert.equal(await exists(join(codexHomeDir, 'skills', 'rails8')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'skills', 'rails8')), false);
    assert.equal(await exists(join(userHomeDir, '.claude', 'commands', 'rails8.md')), false);
    assert.equal(secondRemoval.removedFromCodex, false);
    assert.equal(secondRemoval.removedFromClaude, false);
    assert.equal(secondRemoval.removedCommand, false);
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
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

test('updates all installed skills from current templates', async () => {
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
      '# Guia novo\n',
    );
    assert.equal(
      await readFile(join(userHomeDir, '.claude', 'skills', 'react', 'references', 'guide.md'), 'utf8'),
      '# React novo\n',
    );
    assert.equal(
      await readFile(join(userHomeDir, '.claude', 'commands', 'react.md'), 'utf8'),
      'Invoke the `react` skill. $ARGUMENTS\n',
    );
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});
