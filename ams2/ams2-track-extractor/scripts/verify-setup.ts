#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Verify manual setup is complete
 * Checks for required paths and tools
 */

interface SetupCheck {
    name: string;
    required: boolean;
    check: () => Promise<boolean>;
    help: string;
}

async function main() {
    console.log(chalk.bold.blue('🔍 Setup Verification\n'));

    const checks: SetupCheck[] = [
        {
            name: 'AMS2 Installation Path',
            required: false,
            check: async () => {
                try {
                    const content = await fs.readFile('AMS2_PATH.txt', 'utf-8');
                    const ams2Path = content.trim();
                    await fs.access(ams2Path);
                    console.log(chalk.gray(`  Path: ${ams2Path}`));
                    return true;
                } catch {
                    return false;
                }
            },
            help: 'Create AMS2_PATH.txt with path to Automobilista 2 installation (needed for Approach 3/4)',
        },
        {
            name: 'PCarsTools Path',
            required: false,
            check: async () => {
                try {
                    const content = await fs.readFile('PCARSTOOLS_PATH.txt', 'utf-8');
                    const pcarsPath = content.trim();
                    await fs.access(pcarsPath);
                    console.log(chalk.gray(`  Path: ${pcarsPath}`));
                    return true;
                } catch {
                    return false;
                }
            },
            help: 'Create PCARSTOOLS_PATH.txt with path to PCarsTools.exe (needed for Approach 3/4)',
        },
        {
            name: 'Blender Path',
            required: false,
            check: async () => {
                try {
                    const content = await fs.readFile('BLENDER_PATH.txt', 'utf-8');
                    const blenderPath = content.trim();
                    await fs.access(blenderPath);
                    console.log(chalk.gray(`  Path: ${blenderPath}`));
                    return true;
                } catch {
                    return false;
                }
            },
            help: 'Create BLENDER_PATH.txt with path to blender.exe (needed for Approach 1/3/4)',
        },
        {
            name: 'Node Modules',
            required: true,
            check: async () => {
                try {
                    await fs.access('node_modules');
                    return true;
                } catch {
                    return false;
                }
            },
            help: 'Run: npm install',
        },
        {
            name: 'Telemetry Data Directory',
            required: false,
            check: async () => {
                try {
                    await fs.access('telemetry-data');
                    const files = await fs.readdir('telemetry-data');
                    const jsonFiles = files.filter(f => f.endsWith('.json'));
                    if (jsonFiles.length > 0) {
                        console.log(chalk.gray(`  Found ${jsonFiles.length} telemetry file(s)`));
                    }
                    return true;
                } catch {
                    return false;
                }
            },
            help: 'Create telemetry-data/ directory and add telemetry recordings (needed for Approach 2)',
        },
        {
            name: 'Output Directories',
            required: true,
            check: async () => {
                try {
                    await fs.access('converted-tracks');
                    await fs.access('extracted-tracks');
                    return true;
                } catch {
                    return false;
                }
            },
            help: 'Output directories should be created automatically',
        },
    ];

    let allPassed = true;
    let requiredPassed = true;

    for (const check of checks) {
        process.stdout.write(chalk.cyan(`Checking ${check.name}... `));

        const passed = await check.check();

        if (passed) {
            console.log(chalk.green('✓'));
        } else {
            if (check.required) {
                console.log(chalk.red('✗ REQUIRED'));
                requiredPassed = false;
            } else {
                console.log(chalk.yellow('⚠ Optional'));
            }
            console.log(chalk.gray(`  ${check.help}`));
            allPassed = false;
        }
    }

    console.log();

    if (requiredPassed) {
        console.log(chalk.bold.green('✅ Required setup complete!'));

        if (!allPassed) {
            console.log(chalk.yellow('\nOptional components missing:'));
            console.log(chalk.gray('  • For Approach 2 (Procedural): Telemetry data needed'));
            console.log(chalk.gray('  • For Approach 3/4 (Extraction): AMS2 path, PCarsTools, Blender needed'));
            console.log(chalk.gray('\nYou can still use Approach 1 (Community Models)'));
        }
    } else {
        console.log(chalk.bold.red('❌ Required setup incomplete'));
        console.log(chalk.gray('\nRun: npm install'));
    }

    console.log(chalk.cyan('\nFor detailed setup instructions, see: MANUAL-SETUP.md'));

    process.exit(requiredPassed ? 0 : 1);
}

main().catch((error) => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
});
