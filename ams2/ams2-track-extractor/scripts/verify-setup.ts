#!/usr/bin/env tsx

/**
 * Setup Verification Script
 * 
 * Verifies all prerequisites for PCarsTools track extraction are met.
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

interface CheckResult {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
}

const results: CheckResult[] = [];

function check(name: string, test: () => boolean, passMsg: string, failMsg: string, isRequired = true): void {
    try {
        const passed = test();
        results.push({
            name,
            status: passed ? 'pass' : (isRequired ? 'fail' : 'warn'),
            message: passed ? passMsg : failMsg
        });
    } catch (error) {
        results.push({
            name,
            status: isRequired ? 'fail' : 'warn',
            message: failMsg + (error instanceof Error ? `: ${error.message}` : '')
        });
    }
}

console.log('🔍 Verifying PCarsTools Setup...\n');

// Check 1: .NET Runtime
check(
    '.NET Runtime',
    () => {
        try {
            const version = execSync('dotnet --version', { encoding: 'utf-8' }).trim();
            const major = parseInt(version.split('.')[0]);
            return major >= 6;
        } catch {
            return false;
        }
    },
    '✓ .NET 6.0+ found',
    '✗ .NET 6.0+ not found - Download from https://dotnet.microsoft.com/download/dotnet/6.0'
);

// Check 2: PCarsTools binary
const pcarstoolsPath = join(process.cwd(), 'tools', 'PCarsTools', 'pcarstools_x64.exe');
check(
    'PCarsTools Binary',
    () => existsSync(pcarstoolsPath),
    `✓ Found: ${pcarstoolsPath}`,
    `✗ Not found: ${pcarstoolsPath} - See SETUP.md`
);

// Check 3: Oodle DLL
const oodlePath = join(process.cwd(), 'tools', 'PCarsTools', 'oo2core_4_win64.dll');
check(
    'Oodle DLL',
    () => {
        if (!existsSync(oodlePath)) return false;
        const stats = statSync(oodlePath);
        const sizeMB = stats.size / (1024 * 1024);
        return sizeMB >= 0.5 && sizeMB <= 3; // Should be ~0.8-2 MB
    },
    `✓ Found: ${oodlePath}`,
    `✗ Not found or wrong size: ${oodlePath} - Copy from AMS2 installation`
);

// Check 4: Blender (optional but recommended)
check(
    'Blender',
    () => {
        try {
            execSync('blender --version', { encoding: 'utf-8' });
            return true;
        } catch {
            return false;
        }
    },
    '✓ Blender found in PATH',
    '⚠ Blender not in PATH - Required for Step 2 (conversion)',
    false // Not required for extraction
);

// Check 5: Node modules
check(
    'Node Modules',
    () => existsSync(join(process.cwd(), 'node_modules')),
    '✓ Dependencies installed',
    '✗ Dependencies not installed - Run: npm install'
);

// Check 6: Output directories (optional - will be created)
check(
    'Output Directories',
    () => {
        const extractedDir = join(process.cwd(), 'extracted-tracks');
        const convertedDir = join(process.cwd(), 'converted-tracks');
        return existsSync(extractedDir) || existsSync(convertedDir);
    },
    '✓ Output directories exist',
    'ℹ Output directories will be created on first use',
    false
);

// Print results
console.log('Results:\n');

let hasFailures = false;
let hasWarnings = false;

for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);

    if (result.status === 'fail') hasFailures = true;
    if (result.status === 'warn') hasWarnings = true;
}

// Summary
console.log('─'.repeat(60));

if (hasFailures) {
    console.log('\n❌ Setup INCOMPLETE - Fix required items above');
    console.log('\n📖 See SETUP.md for detailed instructions');
    process.exit(1);
} else if (hasWarnings) {
    console.log('\n⚠️ Setup PARTIAL - Some optional components missing');
    console.log('✓ You can proceed with extraction (Step 1)');
    console.log('⚠️ Install Blender for conversion (Step 2)');
    process.exit(0);
} else {
    console.log('\n✅ Setup COMPLETE - Ready to extract tracks!');
    console.log('\n🚀 Next steps:');
    console.log('   1. See GETTING-STARTED.md for extraction guide');
    console.log('   2. Start with: npm run extract -- --help');
    process.exit(0);
}
