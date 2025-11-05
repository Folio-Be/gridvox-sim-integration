import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Hex Diff Analyzer
 * Compares two binary save files and shows byte-level differences
 */

function bytesToHex(bytes, offset, length = 16) {
    const slice = bytes.slice(offset, offset + length);
    return Array.from(slice)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}

function bytesToAscii(bytes, offset, length = 16) {
    const slice = bytes.slice(offset, offset + length);
    return Array.from(slice)
        .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.')
        .join('');
}

function compareFiles(file1Path, file2Path, label1, label2) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 COMPARING FILES`);
    console.log(`${'='.repeat(80)}`);
    console.log(`File 1 (${label1}): ${path.basename(file1Path)}`);
    console.log(`File 2 (${label2}): ${path.basename(file2Path)}`);
    console.log(`${'='.repeat(80)}\n`);

    // Read both files
    const buf1 = fs.readFileSync(file1Path);
    const buf2 = fs.readFileSync(file2Path);

    console.log(`📏 File Sizes:`);
    console.log(`   ${label1}: ${buf1.length} bytes`);
    console.log(`   ${label2}: ${buf2.length} bytes\n`);

    if (buf1.length !== buf2.length) {
        console.log(`⚠️  WARNING: Files have different sizes!\n`);
    }

    // Find all differences
    const differences = [];
    const maxLen = Math.max(buf1.length, buf2.length);

    for (let i = 0; i < maxLen; i++) {
        const byte1 = i < buf1.length ? buf1[i] : undefined;
        const byte2 = i < buf2.length ? buf2[i] : undefined;

        if (byte1 !== byte2) {
            differences.push({
                offset: i,
                byte1,
                byte2
            });
        }
    }

    console.log(`🔍 Differences Found: ${differences.length}\n`);

    if (differences.length === 0) {
        console.log(`✅ Files are identical!\n`);
        return;
    }

    // Display summary table
    console.log(`${'─'.repeat(80)}`);
    console.log(`| Offset | Offset (Hex) | ${label1.padEnd(12)} | ${label2.padEnd(12)} | Hex Values |`);
    console.log(`${'─'.repeat(80)}`);

    differences.forEach(diff => {
        const offsetDec = diff.offset.toString().padStart(6);
        const offsetHex = `0x${diff.offset.toString(16).toUpperCase().padStart(4, '0')}`.padEnd(12);
        const val1 = diff.byte1 !== undefined ? diff.byte1.toString().padEnd(12) : 'EOF'.padEnd(12);
        const val2 = diff.byte2 !== undefined ? diff.byte2.toString().padEnd(12) : 'EOF'.padEnd(12);
        const hex1 = diff.byte1 !== undefined ? `0x${diff.byte1.toString(16).toUpperCase().padStart(2, '0')}` : '--';
        const hex2 = diff.byte2 !== undefined ? `0x${diff.byte2.toString(16).toUpperCase().padStart(2, '0')}` : '--';

        console.log(`| ${offsetDec} | ${offsetHex} | ${val1} | ${val2} | ${hex1} → ${hex2} |`);
    });

    console.log(`${'─'.repeat(80)}\n`);

    // Show context for first few differences
    console.log(`📋 HEX CONTEXT (first 10 differences):\n`);

    differences.slice(0, 10).forEach((diff, idx) => {
        const contextStart = Math.max(0, diff.offset - 8);
        const contextLength = 32;

        console.log(`${idx + 1}. Offset ${diff.offset} (0x${diff.offset.toString(16).toUpperCase().padStart(4, '0')}):`);
        console.log(`   ${label1}: ${bytesToHex(buf1, contextStart, contextLength)}`);
        console.log(`   ${' '.repeat(label1.length + 2)}${bytesToAscii(buf1, contextStart, contextLength)}`);
        console.log(`   ${label2}: ${bytesToHex(buf2, contextStart, contextLength)}`);
        console.log(`   ${' '.repeat(label2.length + 2)}${bytesToAscii(buf2, contextStart, contextLength)}`);
        console.log();
    });

    // Generate patch data
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔧 PATCH DATA (for automated patching)`);
    console.log(`${'='.repeat(80)}\n`);

    console.log(`const patches = [`);
    differences.forEach(diff => {
        const hex1 = diff.byte1 !== undefined ? `0x${diff.byte1.toString(16).toUpperCase().padStart(2, '0')}` : 'undefined';
        const hex2 = diff.byte2 !== undefined ? `0x${diff.byte2.toString(16).toUpperCase().padStart(2, '0')}` : 'undefined';
        console.log(`  { offset: ${diff.offset}, from: ${hex1}, to: ${hex2} }, // 0x${diff.offset.toString(16).toUpperCase().padStart(4, '0')}`);
    });
    console.log(`];\n`);

    return differences;
}

// Main execution
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log(`Usage: node hex-diff.js <file1> <file2> [label1] [label2]`);
        console.log(`\nExample:`);
        console.log(`  node hex-diff.js snapshots/BMW.sav snapshots/Mercedes.sav BMW Mercedes`);
        process.exit(1);
    }

    const file1 = args[0];
    const file2 = args[1];
    const label1 = args[2] || 'File 1';
    const label2 = args[3] || 'File 2';

    if (!fs.existsSync(file1)) {
        console.error(`❌ Error: File not found: ${file1}`);
        process.exit(1);
    }

    if (!fs.existsSync(file2)) {
        console.error(`❌ Error: File not found: ${file2}`);
        process.exit(1);
    }

    compareFiles(file1, file2, label1, label2);
}

export { compareFiles };
