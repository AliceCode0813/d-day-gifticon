const { spawn } = require('child_process');
const path = require('path');
const { getProjectRoot, spawnLocalExpo } = require('./spawn-local-expo');

const PORT = 8083;
const projectRoot = getProjectRoot();

function spawnNpx(args, options = {}) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/d', '/s', '/c', 'npx', ...args], {
      cwd: projectRoot,
      shell: false,
      windowsHide: true,
      ...options,
    });
  }

  return spawn('npx', args, {
    cwd: projectRoot,
    shell: false,
    ...options,
  });
}

function startCloudflaredTunnel(port) {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log('========================================');
    console.log('  Remote connection (different Wi-Fi OK)');
    console.log('========================================');
    console.log('');
    console.log('Creating tunnel (Cloudflare)...');

    const proc = spawnNpx(
      ['-y', 'cloudflared', 'tunnel', '--url', `http://127.0.0.1:${port}`],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let output = '';
    let resolved = false;
    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Tunnel timed out. Check your internet connection and try again.'));
    }, 90000);

    const handleOutput = (chunk) => {
      const text = chunk.toString();
      process.stderr.write(text);
      output += text;

      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.log('');
        console.log('Tunnel ready:', match[0]);
        console.log('');
        console.log('Next:');
        console.log('1. Wait for Metro + QR code below');
        console.log('2. Expo Go -> Scan QR code');
        console.log('3. Phone can use LTE or any Wi-Fi');
        console.log('');
        resolve({ url: match[0], process: proc });
      }
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput);

    proc.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && code !== null && !output.match(/trycloudflare\.com/)) {
        clearTimeout(timeout);
        reject(new Error(`cloudflared exited with code ${code}`));
      }
    });
  });
}

function toProxyUrl(tunnelUrl) {
  return tunnelUrl.replace(/^https:\/\//, 'http://');
}

function startExpo(tunnelUrl) {
  const proxyUrl = toProxyUrl(tunnelUrl);
  console.log('Expo proxy URL:', proxyUrl);
  console.log('Manual URL (if QR fails):', `exp://${proxyUrl.replace(/^http:\/\//, '')}:80`);
  console.log('');

  return spawnLocalExpo(['start', '--go', '--lan', '--port', String(PORT), '--clear'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_PACKAGER_PROXY_URL: proxyUrl,
    },
  });
}

async function main() {
  let tunnel;

  try {
    tunnel = await startCloudflaredTunnel(PORT);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('');
    console.error('Remote tunnel failed:', message);
    console.error('');
    console.error('Try one of these instead:');
    console.error('  Same Wi-Fi:  npm.cmd run start:lan');
    console.error('  USB (Android): npm.cmd run start:usb');
    console.error('');
    process.exit(1);
  }

  const expoProcess = startExpo(tunnel.url);

  const cleanup = () => {
    try {
      tunnel.process.kill();
    } catch {
      // ignore cleanup errors
    }
  };

  process.on('SIGINT', () => {
    cleanup();
    expoProcess.kill();
    process.exit(0);
  });

  expoProcess.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });
}

main();
