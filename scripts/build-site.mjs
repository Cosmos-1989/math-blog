import { execFileSync } from 'node:child_process';
import { root } from './site-config.mjs';

for (const [command, args] of [
  [process.execPath, ['scripts/apply-theme.mjs']],
  ['opam', ['exec', '--', 'forester', 'build', 'forest.toml']],
  [process.execPath, ['tests/static-html.test.mjs']],
  [process.execPath, ['scripts/build-static-html.mjs']],
  [process.execPath, ['scripts/check-static-html.mjs']],
  [process.execPath, ['scripts/check-reading-ui.mjs']],
]) execFileSync(command, args, { cwd: root, stdio: 'inherit' });
