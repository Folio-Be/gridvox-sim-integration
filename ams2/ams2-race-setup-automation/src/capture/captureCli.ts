import { captureScreenshot } from './captureService';

function parseArgs() {
  const args = process.argv.slice(2);
  const cli: { output: string; prefix?: string; note?: string; hotkey?: string } = {
    output: 'data/captures',
  };

  for (const arg of args) {
    if (arg.startsWith('--output=')) {
      const [, value = ''] = arg.split('=');
      cli.output = value;
    }
    if (arg.startsWith('--prefix=')) {
      const [, value = ''] = arg.split('=');
      cli.prefix = value;
    }
    if (arg.startsWith('--note=')) {
      const [, value = ''] = arg.split('=');
      cli.note = value;
    }
    if (arg.startsWith('--hotkey=')) {
      const [, value = ''] = arg.split('=');
      cli.hotkey = value;
    }
  }

  return cli;
}

async function main() {
  const { output, prefix, note, hotkey } = parseArgs();
  const captureOptions: Parameters<typeof captureScreenshot>[0] = { outputDir: output };
  if (prefix) captureOptions.prefix = prefix;
  if (note) captureOptions.note = note;
  if (hotkey) captureOptions.hotkey = hotkey;
  const result = await captureScreenshot(captureOptions);
  console.log(
    JSON.stringify(
      {
        message: 'capture-complete',
        imagePath: result.imagePath,
        metadataPath: result.metadataPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error('capture failed', error);
  process.exit(1);
});
