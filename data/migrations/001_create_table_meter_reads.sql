-- Up 
CREATE TABLE `meter_reads` (
    cumulative INTEGER,
    reading_date TEXT,
    unit TEXT
);

-- Down 
DROP TABLE IF EXISTS `meter_reads`;
