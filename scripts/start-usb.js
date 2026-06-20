const { spawnSync } = require('child_process');
const { spawnLocalExpo } = require('./spawn-local-expo');

const PORT = 8083;

function setupUsbReverse() {
  console.log('');
  console.log('========================================');
  console.log('  USB connection (any Wi-Fi / LTE OK)');
  console.log('========================================');
  console.log('');
  console.log('Setting up adb reverse...');

  const result = spawnSync('adb', ['reverse', `tcp:${PORT}`, `tcp:${PORT}`], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    console.error('');
    console.error('adb reverse failed. Check:');
    console.error('  1. Phone connected by USB');
    console.error('  2. USB debugging enabled');
    console.error('  3. adb installed (Android SDK platform-tools)');
    console.error('');
    if (result.stderr) {
      console.error(result.stderr.trim());
    }
    process.exit(1);
  }

  console.log('USB tunnel ready.');
  console.log('');
  console.log('Next: Scan QR code in Expo Go (uses localhost via USB).');
  console.log('');
}

setupUsbReverse();

spawnLocalExpo(['start', '--go', '--localhost', '--port', String(PORT)], {
  stdio: 'inherit',
});
