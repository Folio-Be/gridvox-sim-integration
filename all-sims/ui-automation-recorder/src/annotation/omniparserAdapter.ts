import { spawn } from 'child_process';

export interface PreAnnotateOptions {
  inputDir: string;
  outputDir: string;
  pythonPath?: string;
}

export async function runBatchPreannotate(options: PreAnnotateOptions): Promise<void> {
  const python = options.pythonPath ?? 'python';
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      python,
      ['scripts/batch_preannotate.py', '--input', options.inputDir, '--output', options.outputDir],
      { stdio: 'inherit' },
    );
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`batch_preannotate exited with code ${code}`));
    });
  });
}
