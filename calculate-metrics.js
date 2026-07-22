const fs = require('fs');

const rawData = fs.readFileSync('test-results.json', 'utf8');
const results = JSON.parse(rawData);

let totalTests = results.suites.reduce((acc, suite) => acc + suite.specs.length, 0);
let passedTests = 0;
let failedTests = 0;
let flakyTests = 0;
let totalDurationMs = 0;

results.suites.forEach(suite => {
  suite.specs.forEach(spec => {
    const test = spec.tests[0];
    totalDurationMs += test.duration;
    if (test.status === 'expected') {
      passedTests++;
      if (test.retry) { flakyTests++; }
    } else if (test.status === 'unexpected') {
      failedTests++;
    }
  });
});

const executionTimeMins = (totalDurationMs / 60000).toFixed(2);
const manualRegressionTimeMins = 240;
const timeSavedMins = manualRegressionTimeMins - executionTimeMins;
const costPerMinute = 1.50;
const moneySaved = (timeSavedMins * costPerMinute).toFixed(2);

console.log(`=====================================================`);
console.log(`QA AUTOMATION EXECUTIVE DASHBOARD`);
console.log(`=====================================================`);
console.log(`Total Tests Run:   ${totalTests}`);
console.log(`Passed:          ${passedTests}`);
console.log(`Failed:          ${failedTests}`);
console.log(`FLAKY:          ${flakyTests}`);
console.log(`-----------------------------------------------------`);
console.log(`Execution Time: ${executionTimeMins} mins`);
console.log(`-----------------------------------------------------`);
console.log(`ROI CALCULATIONS:`);
console.log(`Manual Time Est: ${manualRegressionTimeMins} mins`);
console.log(`Auto Time:       ${executionTimeMins} mins`);
console.log(`Time Saved:      ${timeSavedMins} mins`);
console.log(`Saved/Run:    $${moneySaved}`);
console.log(`=====================================================`);

  console.error("QUALITY GATE FAILED: Flaky tests detected!");
  process.exit(1);
}
  console.error("QUALITY GATE FAILED: Functional defects found.");
  process.exit(1);
}
console.log("QUALITY GATE PASSED: Suite is stable and reliable.");
