#!/usr/bin/env node

/**
 * Batch Runner for AMS2 Race Configuration Testing
 * Runs multiple race configurations sequentially for testing
 */

import AMS2RaceAutomation from './index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configurations
const TEST_CONFIGS = [
  {
    name: 'Interlagos GT3 Clear',
    config: {
      track: 'Interlagos',
      carClass: 'GT3',
      opponents: { count: 20, difficulty: 'Medium', aggression: 50 },
      weather: 'Clear',
      timeOfDay: 'Noon',
      sessionLength: { type: 'laps', value: 10 },
    },
  },
  {
    name: 'Spa GT3 Rain',
    config: {
      track: 'Spa-Francorchamps',
      carClass: 'GT3',
      opponents: { count: 25, difficulty: 'Hard', aggression: 60 },
      weather: 'Light Rain',
      timeOfDay: 'Afternoon',
      sessionLength: { type: 'laps', value: 15 },
    },
  },
  {
    name: 'Silverstone Formula V10',
    config: {
      track: 'Silverstone',
      carClass: 'Formula V10',
      opponents: { count: 18, difficulty: 'Hard', aggression: 70 },
      weather: 'Overcast',
      timeOfDay: 'Morning',
      sessionLength: { type: 'laps', value: 20 },
    },
  },
  {
    name: 'Nurburgring Stock Car',
    config: {
      track: 'Nurburgring GP',
      carClass: 'Stock Car',
      opponents: { count: 30, difficulty: 'Medium', aggression: 55 },
      weather: 'Clear',
      timeOfDay: 'Dusk',
      sessionLength: { type: 'time', value: 30 },
    },
  },
  {
    name: 'Curitiba Touring Cars Night',
    config: {
      track: 'Curitiba',
      carClass: 'Touring Cars',
      opponents: { count: 22, difficulty: 'Easy', aggression: 40 },
      weather: 'Clear',
      timeOfDay: 'Night',
      sessionLength: { type: 'laps', value: 12 },
    },
  },
];

class BatchRunner {
  constructor() {
    this.automation = new AMS2RaceAutomation();
    this.results = [];
  }

  /**
   * Run all test configurations
   */
  async runAll() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('AMS2 Batch Configuration Testing');
    console.log(`Running ${TEST_CONFIGS.length} test configurations`);
    console.log(`${'='.repeat(60)}\n`);

    for (let i = 0; i < TEST_CONFIGS.length; i++) {
      const test = TEST_CONFIGS[i];
      console.log(`\n[${i + 1}/${TEST_CONFIGS.length}] ${test.name}`);
      console.log('-'.repeat(60));

      const startTime = Date.now();

      try {
        const result = await this.automation.runAutomation(test.config);
        const duration = Date.now() - startTime;

        this.results.push({
          name: test.name,
          success: result.success,
          duration,
          timestamp: new Date().toISOString(),
          error: result.error || null,
        });

        console.log(`✓ Completed in ${(duration / 1000).toFixed(2)}s`);

        // Wait between tests to allow game to stabilize
        if (i < TEST_CONFIGS.length - 1) {
          console.log('Waiting 5 seconds before next test...');
          await this.sleep(5000);
        }
      } catch (error) {
        const duration = Date.now() - startTime;

        this.results.push({
          name: test.name,
          success: false,
          duration,
          timestamp: new Date().toISOString(),
          error: error.message,
        });

        console.error(`✗ Failed: ${error.message}`);
      }
    }

    // Generate report
    await this.generateReport();
  }

  /**
   * Generate test report
   */
  async generateReport() {
    const successCount = this.results.filter(r => r.success).length;
    const failCount = this.results.filter(r => !r.success).length;
    const successRate = ((successCount / this.results.length) * 100).toFixed(1);
    const avgDuration =
      this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length / 1000;

    const report = {
      summary: {
        total: this.results.length,
        success: successCount,
        failed: failCount,
        successRate: `${successRate}%`,
        averageDuration: `${avgDuration.toFixed(2)}s`,
        timestamp: new Date().toISOString(),
      },
      results: this.results,
    };

    // Save report to file
    const reportPath = path.join(__dirname, '../logs', 'batch-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('BATCH TEST SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Tests:      ${report.summary.total}`);
    console.log(`Successful:       ${report.summary.success} ✓`);
    console.log(`Failed:           ${report.summary.failed} ✗`);
    console.log(`Success Rate:     ${report.summary.successRate}`);
    console.log(`Average Duration: ${report.summary.averageDuration}`);
    console.log(`\nReport saved to: ${reportPath}`);
    console.log(`${'='.repeat(60)}\n`);

    // Show failures
    const failures = this.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\nFailed Tests:');
      failures.forEach(f => {
        console.log(`  ✗ ${f.name}: ${f.error}`);
      });
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run batch tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new BatchRunner();

  runner
    .runAll()
    .then(() => {
      const successRate = runner.results.filter(r => r.success).length / runner.results.length;
      process.exit(successRate >= 0.9 ? 0 : 1); // Exit code 0 if ≥90% success
    })
    .catch(error => {
      console.error('Fatal error in batch runner:', error);
      process.exit(1);
    });
}

export default BatchRunner;
