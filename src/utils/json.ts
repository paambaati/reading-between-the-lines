/**
 * JSON read utilities.
 */

import { readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

/**
 * Asynchronous JSON Reader.
 */
export default class JsonReader {
  /**
   * Asynchronous JSON file reader.
   * @param {string} fileName Full path + filename of JSON file to read.
   * @memberof JsonReader
   */
  constructor(private fileName: string) {}

  /**
   * Read file asynchronously and parse JSON from it.
   *
   * @returns {object} JSON object.
   * @memberof JsonReader
   */
  public read() {
    return readFileAsync(this.fileName, { encoding: 'utf-8' }).then(data => {
      return JSON.parse(data);
    });
  }
}
