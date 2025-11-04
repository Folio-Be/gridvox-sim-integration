import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANNOTATIONS_FILE = path.join(__dirname, 'annotations.log');
const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');
const REPORT_FILE = path.join(__dirname, 'analysis-report.md');

// Parse annotations log
function parseAnnotations() {
  const content = fs.readFileSync(ANNOTATIONS_FILE, 'utf8');
  const lines = content.split('\n').slice(2); // Skip header

  const entries = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(' | ');
    if (parts.length < 4) continue;

    entries.push({
      timestamp: parts[0].trim(),
      filename: parts[1].trim(),
      snapshot: parts[2].trim(),
      annotation: parts[3].trim()
    });
  }

  return entries;
}

// Find byte differences between two files
function findByteChanges(file1, file2) {
  const buf1 = fs.readFileSync(file1);
  const buf2 = fs.readFileSync(file2);

  const changes = [];
  const maxLen = Math.max(buf1.length, buf2.length);

  for (let i = 0; i < maxLen; i++) {
    const byte1 = i < buf1.length ? buf1[i] : null;
    const byte2 = i < buf2.length ? buf2[i] : null;

    if (byte1 !== byte2) {
      changes.push({
        offset: i,
        offsetHex: '0x' + i.toString(16).toUpperCase().padStart(4, '0'),
        before: byte1 !== null ? byte1 : 'N/A',
        after: byte2 !== null ? byte2 : 'N/A',
        beforeHex: byte1 !== null ? '0x' + byte1.toString(16).toUpperCase().padStart(2, '0') : 'N/A',
        afterHex: byte2 !== null ? '0x' + byte2.toString(16).toUpperCase().padStart(2, '0') : 'N/A'
      });
    }
  }

  return changes;
}

// Group changes by offset to find patterns
function analyzePatterns(changes) {
  const offsetGroups = {};

  for (const change of changes) {
    const offset = change.offset;
    if (!offsetGroups[offset]) {
      offsetGroups[offset] = [];
    }
    offsetGroups[offset].push(change);
  }

  return offsetGroups;
}

// Find related changes (same action type)
function groupByAction(entries) {
  const groups = {};

  for (const entry of entries) {
    const annotation = entry.annotation;
    if (annotation === 'NO ANNOTATION') continue;

    // Try to categorize
    let category = 'other';
    if (annotation.toLowerCase().includes('car') || annotation.toLowerCase().includes('bmw') || annotation.toLowerCase().includes('merc')) {
      category = 'car_selection';
    } else if (annotation.toLowerCase().includes('track')) {
      category = 'track_selection';
    } else if (annotation.toLowerCase().includes('weather')) {
      category = 'weather';
    } else if (annotation.toLowerCase().includes('time')) {
      category = 'time';
    }

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(entry);
  }

  return groups;
}

// Main analysis
function analyze() {
  console.log('📊 AMS2 Savegame Analyzer\n');

  const entries = parseAnnotations();
  console.log(`Found ${entries.length} logged changes\n`);

  const groups = groupByAction(entries);

  let report = '# AMS2 Savegame Analysis Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Total changes logged: ${entries.length}\n\n`;
  report += '---\n\n';

  // Analyze each category
  for (const [category, categoryEntries] of Object.entries(groups)) {
    console.log(`\n📁 Category: ${category}`);
    console.log(`   ${categoryEntries.length} entries`);

    report += `## ${category.toUpperCase()}\n\n`;
    report += `${categoryEntries.length} changes in this category\n\n`;

    // Compare consecutive pairs in this category
    for (let i = 0; i < categoryEntries.length - 1; i++) {
      const entry1 = categoryEntries[i];
      const entry2 = categoryEntries[i + 1];

      // Only compare same file
      if (entry1.filename !== entry2.filename) continue;

      const file1 = path.join(SNAPSHOTS_DIR, entry1.snapshot);
      const file2 = path.join(SNAPSHOTS_DIR, entry2.snapshot);

      if (!fs.existsSync(file1) || !fs.existsSync(file2)) continue;

      console.log(`\n   Comparing:`);
      console.log(`   - ${entry1.annotation}`);
      console.log(`   - ${entry2.annotation}`);

      const changes = findByteChanges(file1, file2);
      console.log(`   → ${changes.length} bytes changed`);

      report += `### ${entry1.annotation} → ${entry2.annotation}\n\n`;
      report += `**File:** \`${entry1.filename}\`\n\n`;
      report += `**Bytes changed:** ${changes.length}\n\n`;

      if (changes.length > 0 && changes.length < 100) {
        report += '**Byte changes:**\n\n';
        report += '| Offset | Offset (Hex) | Before | After | Before (Hex) | After (Hex) |\n';
        report += '|--------|--------------|--------|-------|--------------|-------------|\n';

        for (const change of changes.slice(0, 50)) {
          report += `| ${change.offset} | ${change.offsetHex} | ${change.before} | ${change.after} | ${change.beforeHex} | ${change.afterHex} |\n`;
        }

        if (changes.length > 50) {
          report += `\n*... and ${changes.length - 50} more changes*\n`;
        }
        report += '\n';

        // Show hex context for first few changes
        if (changes.length > 0 && changes.length < 20) {
          report += '**Hex context (first change):**\n\n';
          const firstChange = changes[0];
          const offset = firstChange.offset;
          const contextStart = Math.max(0, offset - 16);
          const contextEnd = Math.min(fs.statSync(file1).size, offset + 16);

          const buf1 = fs.readFileSync(file1);
          const buf2 = fs.readFileSync(file2);

          report += '```\nBefore:\n';
          for (let i = contextStart; i < contextEnd; i++) {
            if (i % 16 === 0) report += '\n' + i.toString(16).padStart(8, '0') + ': ';
            report += buf1[i].toString(16).padStart(2, '0') + ' ';
            if (i === offset) report += '[CHANGE] ';
          }

          report += '\n\nAfter:\n';
          for (let i = contextStart; i < contextEnd; i++) {
            if (i % 16 === 0) report += '\n' + i.toString(16).padStart(8, '0') + ': ';
            report += buf2[i].toString(16).padStart(2, '0') + ' ';
            if (i === offset) report += '[CHANGE] ';
          }
          report += '\n```\n\n';
        }
      } else if (changes.length >= 100) {
        report += `*Too many changes to list individually (${changes.length} bytes)*\n\n`;
      } else {
        report += `*No changes detected*\n\n`;
      }

      report += '---\n\n';
    }
  }

  // Summary of files that change
  const fileChangeCounts = {};
  for (const entry of entries) {
    fileChangeCounts[entry.filename] = (fileChangeCounts[entry.filename] || 0) + 1;
  }

  report += '## Files Modified\n\n';
  report += '| File | Times Modified |\n';
  report += '|------|----------------|\n';
  for (const [file, count] of Object.entries(fileChangeCounts).sort((a, b) => b[1] - a[1])) {
    report += `| ${file} | ${count} |\n`;
  }
  report += '\n';

  // Write report
  fs.writeFileSync(REPORT_FILE, report);

  console.log(`\n✅ Analysis complete!`);
  console.log(`📄 Report saved to: ${REPORT_FILE}`);
}

// Run analysis
try {
  analyze();
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
