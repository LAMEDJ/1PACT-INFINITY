/**
 * Lance npm sans la variable NPM_CONFIG_DEVDIR pour éviter l'avertissement
 * "Unknown env config devdir" (injectée par certains environnements).
 */
const { spawn } = require('child_process');

const env = { ...process.env };
delete env.NPM_CONFIG_DEVDIR;

const args = process.argv.slice(2);
const isWindows = process.platform === 'win32';
const child = spawn(isWindows ? 'npm.cmd' : 'npm', args, {
  env,
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('exit', (code) => process.exit(code ?? 0));
