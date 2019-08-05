import test from 'tape';
import Readings from '../../src/core/readings';
import { electricity as fixture1 } from '../fixtures/readings_1.json';
import { electricity as fixture2 } from '../fixtures/readings_2.json';
import { electricity as fixture3 } from '../fixtures/readings_3.json';

/**
 * Tests.
 */

test('✨ CORE/readings — interpolateEndOfMonthReading() should interpolate end of month readings', async t => {
  t.plan(4);

  // Case #0 - Happy path.
  let output = Readings.interpolateEndOfMonthReading(
    fixture1[1],
    fixture1[0],
    fixture1[2]
  );
  t.equal(
    output.cumulative,
    17917,
    'should have interpolated cumulative reading'
  );
  t.equal(
    output.readingDate,
    '2017-04-30T00:00:00.000Z',
    'should have set reading date to end of month and timestamp to 0-hour'
  );

  // Case #1 - no closest data point to interpolate from.
  output = Readings.interpolateEndOfMonthReading(
    fixture2[1],
    fixture2[0],
    fixture2[2]
  );
  t.equal(
    output.cumulative,
    17759,
    'should not interpolate reading when it is on the edge'
  );

  // Case #2 - data is already in expected form (i.e. all readings are month end).
  output = Readings.interpolateEndOfMonthReading(
    fixture3[1],
    fixture3[0],
    fixture3[2]
  );
  t.deepEqual(
    output,
    {
      cumulative: 18620,
      readingDate: '2017-08-31T00:00:00.000Z',
      unit: 'kWh'
    },
    "should not interpolate reading when it is already on the month's end"
  );
  t.end();
});
