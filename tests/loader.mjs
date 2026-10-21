import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if ((err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ERR_UNSUPPORTED_DIR_IMPORT') && specifier.startsWith('.') && context.parentURL) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      for (const ext of ['.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.js']) {
        const candidate = path.resolve(parentDir, specifier + ext);
        if (fs.existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    throw err;
  }
}
