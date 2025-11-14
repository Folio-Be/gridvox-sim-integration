#!/usr/bin/env ts-node
import { validateSimProfile } from '../src/config/profileValidation';
import { loadSimProfile, SimProfileError } from '../src/config/simProfile';

interface CliArgs {
  [key: string]: string | undefined;
}

const args = parseArgs(process.argv.slice(2));
const sim = args.sim ?? args.name ?? args.id;

if (!sim) {
  console.error('Usage: pnpm run validate-profile -- --sim <profile>');
  process.exit(1);
}

try {
  const profile = loadSimProfile(sim);
  const result = validateSimProfile(profile, { simId: sim });
  console.log(`✔ Sim profile "${sim}" is valid.`);
  if (result.warnings.length > 0) {
    console.warn('Warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
} catch (err) {
  if (err instanceof SimProfileError) {
    console.error(`✖ ${err.message}`);
    err.details.forEach((detail) => console.error(`  - ${detail}`));
    process.exit(1);
  }
  throw err;
}

function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        result[key] = value;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}
