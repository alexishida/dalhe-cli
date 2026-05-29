import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import test from 'node:test';
import { TemplateCopier } from '../src/services/TemplateCopier.js';

test('copies template files into target directory', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-'));
  const sourceDir = join(workspace, 'template');
  const targetDir = join(workspace, 'target');

  try {
    await mkdir(join(sourceDir, 'nested'), { recursive: true });
    await writeFile(join(sourceDir, 'AGENTS.md'), 'agents');
    await writeFile(join(sourceDir, 'nested', 'CLAUDE.md'), 'claude');

    const result = await new TemplateCopier().copy({ sourceDir, targetDir });

    assert.equal(result.filesCopied, 2);
    assert.equal(await readFile(join(targetDir, 'AGENTS.md'), 'utf8'), 'agents');
    assert.equal(await readFile(join(targetDir, 'nested', 'CLAUDE.md'), 'utf8'), 'claude');
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});

test('fails before overwriting existing target file', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dalhe-cli-'));
  const sourceDir = join(workspace, 'template');
  const targetDir = join(workspace, 'target');

  try {
    await mkdir(sourceDir, { recursive: true });
    await mkdir(targetDir, { recursive: true });
    await writeFile(join(sourceDir, 'AGENTS.md'), 'new');
    await writeFile(join(targetDir, 'AGENTS.md'), 'old');

    await assert.rejects(
      () => new TemplateCopier().copy({ sourceDir, targetDir }),
      /Arquivos ja existem/,
    );

    assert.equal(await readFile(join(targetDir, 'AGENTS.md'), 'utf8'), 'old');
  } finally {
    await rm(workspace, { force: true, recursive: true });
  }
});
