const { spawn } = require('child_process');
const path = require('path');

function getProjectRoot() {
  return path.join(__dirname, '..');
}

function spawnLocalExpo(args, options = {}) {
  const projectRoot = getProjectRoot();
  const expoCli = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli');

  return spawn(process.execPath, [expoCli, ...args], {
    cwd: projectRoot,
    shell: false,
    windowsHide: true,
    ...options,
  });
}

module.exports = { getProjectRoot, spawnLocalExpo };
