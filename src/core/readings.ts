import { parseISO, endOfMonth, differenceInDays } from 'date-fns';
import Database from '../utils/database';

// Initializers.
const db = new Database(); // Returns singleton DB class.
const TABLE = 'meter_reads';

/**
 * Meter readings core logic.
 */

/**
 * Meter reading.
 */
export interface Reading {
  /**
   * Cumulative meter reading.
   */
  cumulative: number;
  /**
   * Reading date.
   * Use an ISO-8601 string in UTC timezone.
   */
  readingDate: string;
  /**
   * Unit of the energy reading.
   * Usually 'kWh'.
   */
  unit: string;
}

/**
 * Meter reading with monthly usage.
 */
export interface ReadingWithUsage extends Reading {
  /**
   * Monthly usage.
   */
  usage: number;
}

/**
 * Meter readings class.
 *
 * Use to get and put meter readings from/in the database.
 */
export default class Readings {
  private static getUTCDate(date: Date = new Date()) {
    const utcDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000
    ); // Adjust for local timezone.
    utcDate.setUTCHours(0, 0, 0, 0); // Set all time counters to 0.
    return utcDate;
  }

  private static getReadingsFromDB(): Reading[] {
    const results = db.select(`SELECT * FROM ${TABLE} ORDER BY cumulative`);
    // For converting from the 'reading_date` DB column to `readingDate` in <Reading>.
    return results.map(row => {
      return {
        cumulative: row['cumulative'],
        readingDate: row['reading_date'],
        unit: row['unit']
      };
    });
  }

  /**
   * Given 2 readings (current and previous), this method calculates
   * the units used between the 2 months.
   *
   * ⚠️ Use only when both readings are from the end of the month.
   *
   * @param currentReading
   * @param previousReading
   */
  private static calculateUsage(
    currentReading: Reading,
    previousReading: Reading | undefined
  ): ReadingWithUsage {
    if (!previousReading) {
      return {
        ...currentReading,
        usage: 0
      };
    }
    const usage = currentReading.cumulative - previousReading.cumulative;
    return {
      ...currentReading,
      usage
    };
  }

  /**
   * Given 3 readings (current, previous and next), this method interpolates
   * the data points to return end-of-month readings.
   *
   * ⚠️ Does not interpolate for edges in the readings.
   *
   * Simple implementation of https://wikihow.com/Interpolate
   * Further reading —  https://en.wikipedia.org/wiki/Linear_interpolation
   *
   * @param currentReading - Latest reading.
   * @param lastReading - Previous reading.
   * @param nextReading - Next reading.
   * @returns Interpolated end-of-month reading from current reading.
   */
  public static interpolateEndOfMonthReading(
    currentReading: Reading,
    lastReading: Reading | undefined,
    nextReading: Reading | undefined
  ): Reading {
    if (!lastReading || !nextReading) return currentReading; // Do not interpolate on the edges.

    const monthEnd = endOfMonth(parseISO(currentReading.readingDate));

    // Linear interpolation formula from https://wikihow.com/Interpolate
    /**
     * READING        :  last                current    end-of-month       next
     * TIMELINE       : +----------------------+------------+----------------+
     * X (DATE)       :  0                     x1           x               x2
     * Y (CUMULATIVE) :                        y1           y?              y2
     */

    const x1 = differenceInDays(
      parseISO(currentReading.readingDate),
      parseISO(lastReading.readingDate)
    );
    const x2 = differenceInDays(
      parseISO(nextReading.readingDate),
      parseISO(lastReading.readingDate)
    );

    const y1 = currentReading.cumulative;
    const y2 = nextReading.cumulative;

    const x = differenceInDays(monthEnd, parseISO(lastReading.readingDate));
    const y = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);

    const updatedReading = { ...currentReading }; // Make a copy so we don't mutate the original reading.
    updatedReading.cumulative = Math.round(y);
    updatedReading.readingDate = Readings.getUTCDate(monthEnd).toISOString(); // Set reading date to end of month.
    return updatedReading;
  }

  /**
   * Insert a reading into the database.
   * @param reading - Reading object.
   * @returns Original Reading object.
   */
  public static put(reading: Reading): Reading {
    // For converting to the 'reading_date` DB column from `readingDate` in <Reading>.
    const row = {
      cumulative: reading.cumulative,
      reading_date: reading.readingDate,
      unit: reading.unit
    };
    db.insert(TABLE, row);
    return reading;
  }

  /**
   * Get readings from the database along with usage data.
   * Readings are interpolated for end-of-month.
   * @returns Array of Reading objects.
   */
  public static get(): ReadingWithUsage[] {
    const endOfCycleReadings: ReadingWithUsage[] = [];
    let readingWithUsage: ReadingWithUsage;
    const originalReadings = Readings.getReadingsFromDB();
    originalReadings.forEach((reading, index) => {
      const dateObject = parseISO(reading.readingDate);
      const daysToMonthEnd = differenceInDays(
        endOfMonth(dateObject),
        dateObject
      );
      // If the reading isn't from the end of the month, try to guess it by interpolating it.
      if (daysToMonthEnd > 0) {
        const guessedReading = Readings.interpolateEndOfMonthReading(
          reading,
          originalReadings[index - 1],
          originalReadings[index + 1]
        );
        readingWithUsage = Readings.calculateUsage(
          guessedReading,
          endOfCycleReadings[index - 1]
        );
      } else {
        readingWithUsage = Readings.calculateUsage(
          reading,
          endOfCycleReadings[index - 1]
        );
      }
      endOfCycleReadings.push(readingWithUsage);
    });
    return endOfCycleReadings;
  }
}
