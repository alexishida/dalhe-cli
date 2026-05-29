import { copyFile, lstat, mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { CliError } from '../core/CliError.js';

export class TemplateCopier {
  async copy({ sourceDir, targetDir }) {
    await this.#assertDirectory(sourceDir);
    await mkdir(targetDir, { recursive: true });

    const entries = await this.#listEntries(sourceDir);
    await this.#assertNoConflicts({ entries, sourceDir, targetDir });

    const directories = entries.filter((entry) => entry.type === 'directory');
    const files = entries.filter((entry) => entry.type === 'file');

    for (const directory of directories) {
      await mkdir(this.#targetPath({ sourceDir, targetDir, sourcePath: directory.path }), {
        recursive: true,
      });
    }

    for (const file of files) {
      const destination = this.#targetPath({ sourceDir, targetDir, sourcePath: file.path });
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(file.path, destination);
    }

    return {
      targetDir,
      filesCopied: files.length,
      files: files.map((file) => relative(sourceDir, file.path)),
    };
  }

  async #assertDirectory(directory) {
    const info = await stat(directory).catch(() => null);

    if (!info?.isDirectory()) {
      throw new CliError(`Pasta de template nao encontrada: ${directory}`, {
        code: 'TEMPLATE_NOT_FOUND',
      });
    }
  }

  async #listEntries(sourceDir) {
    const entries = [];

    const walk = async (currentDir) => {
      const dirents = await readdir(currentDir, { withFileTypes: true });

      for (const dirent of dirents) {
        const sourcePath = join(currentDir, dirent.name);

        if (dirent.isDirectory()) {
          entries.push({ path: sourcePath, type: 'directory' });
          await walk(sourcePath);
          continue;
        }

        if (dirent.isFile()) {
          entries.push({ path: sourcePath, type: 'file' });
          continue;
        }

        throw new CliError(`Template contem entrada nao suportada: ${relative(sourceDir, sourcePath)}`, {
          code: 'UNSUPPORTED_TEMPLATE_ENTRY',
        });
      }
    };

    await walk(sourceDir);
    return entries;
  }

  async #assertNoConflicts({ entries, sourceDir, targetDir }) {
    const conflicts = [];

    for (const entry of entries) {
      const targetPath = this.#targetPath({ sourceDir, targetDir, sourcePath: entry.path });
      const existing = await lstat(targetPath).catch((error) => {
        if (error.code === 'ENOENT') {
          return null;
        }

        throw error;
      });

      if (!existing) {
        continue;
      }

      if (entry.type === 'directory' && existing.isDirectory()) {
        continue;
      }

      conflicts.push(relative(targetDir, targetPath));
    }

    if (conflicts.length > 0) {
      throw new CliError(
        [
          'Arquivos ja existem no destino. Remova ou renomeie antes de executar:',
          ...conflicts.map((path) => `- ${path}`),
        ].join('\n'),
        { code: 'TARGET_CONFLICT' },
      );
    }
  }

  #targetPath({ sourceDir, targetDir, sourcePath }) {
    return join(targetDir, relative(sourceDir, sourcePath));
  }
}
