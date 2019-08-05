import { join, resolve } from 'path';
import test from 'tape';
import JsonReader from '../../src/utils/json';
import fixture from '../../package.json'; // Use own package.json as a fixture.

/**
 * Tests.
 */

test('✨ UTILS/json — read() should return the parsed JSON object from the file.', t => {
  t.plan(2);
  const jsonFilename = '../../package.json';
  const jsonAbsolutePath = resolve(join(__dirname, jsonFilename));
  new JsonReader(jsonAbsolutePath)
    .read()
    .then(data => {
      t.true(
        data instanceof Object,
        "Should return JSON file's contents as JSON object."
      );
      t.deepEquals(data, fixture, 'JSON object should be intact.');
      t.end();
    })
    .catch(t.fail);
});
