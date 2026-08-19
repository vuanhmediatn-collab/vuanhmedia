const fs = require('fs');
const path = require('path');

const traceFile = path.resolve(__dirname, '../screenshots_v24/performance_trace_1440.json');

if (!fs.existsSync(traceFile)) {
  console.log('Trace file not found:', traceFile);
  process.exit(1);
}

console.log('Reading performance trace:', traceFile);
const trace = JSON.parse(fs.readFileSync(traceFile, 'utf8'));

const events = trace.traceEvents || [];

let totalDurationMs = 0;
let longTasksCount = 0;
let maxTaskDurationMs = 0;
let layoutShifts = [];
let totalLayoutShiftScore = 0;

events.forEach((ev) => {
  // Long Tasks (> 50ms = 50000us)
  if (ev.name === 'RunTask' && ev.dur) {
    const durMs = ev.dur / 1000;
    if (durMs > 50) {
      longTasksCount++;
    }
    if (durMs > maxTaskDurationMs) {
      maxTaskDurationMs = durMs;
    }
  }

  // Layout Shifts
  if (ev.name === 'LayoutShift' && ev.args && ev.args.data) {
    const score = ev.args.data.score || 0;
    if (!ev.args.data.had_recent_input) {
      layoutShifts.push(score);
      totalLayoutShiftScore += score;
    }
  }
});

console.log('\n--- PERFORMANCE TRACE METRICS SUMMARY ---');
console.log(`Total Trace Events: ${events.length}`);
console.log(`Long Tasks (> 50ms): ${longTasksCount}`);
console.log(`Max Single Task Duration: ${maxTaskDurationMs.toFixed(2)} ms`);
console.log(`Cumulative Layout Shift (CLS Score): ${totalLayoutShiftScore.toFixed(4)}`);
console.log(`Layout Shift Events: ${layoutShifts.length}`);
