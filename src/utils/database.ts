/**
 * SQLite3 Database utility.
 */

import DB from 'better-sqlite3-helper';

/**
 * Database Singleton class.
 *
 * Connects to SQLite3 DB and runs migrations on first init.
 */
export default class Database {
  public db: any;
  /**
   * Database class.
   * @param filename - Name of DB file. Set to `null` or `undefined` to use in-memory.
   * @param migrations - Name of migrations directory.
   */
  public constructor(
    filename?: string | undefined,
    migrations?: string | undefined
  ) {
    this.db = DB({
      path: filename || './data/bulb-rbtl.db',
      memory: filename ? false : true,
      migrate: {
        force: false,
        table: 'migration',
        migrationsPath: migrations || './data/migrations'
      }
    });
    return this;
  }

  /**
   * Insert row into table.
   * @param table - Name of table to insert data into.
   * @param row - Data to insert.
   * @returns inserted row.
   */
  public insert(table: string, row: object): object {
    try {
      this.db.insert(table, row);
      return row; // Return original payload because the library returns only the row ID.
    } catch (err) /* istanbul ignore next */ {
      throw err;
    }
  }

  /**
   * Select rows from table.
   * @param table - Name of table to retrieve data from.
   * @returns Rows (null if select failed).
   */
  public select(query: string): object[] {
    try {
      const selected = this.db.query(query);
      // For converting from the 'reading_date` DB column to `readingDate` JS-land key.
      return selected;
    } catch (err) /* istanbul ignore next */ {
      throw err;
    }
  }
}
