'use strict';

import { app, db } from './shared/admin.js';
import fs from 'fs';

const getStatsForMonth = async (startDate, endDate) => {
  const stats = {};

  // Fetch data for Qualifying Tests
  const qualifyingTests = await db.collection('qualifyingTests')
    .where('startDate', '>=', startDate)
    .where('startDate', '<', endDate)
    .where('status', '==', 'completed')
    .select().get();
  stats.qualifyingTests = qualifyingTests.docs.length;

  // Fetch data for Qualifying Test Responses
  const qualifyingTestResponses = await db.collection('qualifyingTestResponses')
    .where('qualifyingTest.startDate', '>=', startDate)
    .where('qualifyingTest.startDate', '<', endDate)
    .where('status', '==', 'completed')
    .select().get();
  stats.qualifyingTestResponses = qualifyingTestResponses.docs.length;

  return stats;
};

const main = async () => {
  const results = [];
  const startYear = 2021; // Starting from January 2021
  const endDate = new Date(); // Current date

  // Iterate over each month from startYear to the current month
  for (let year = startYear; year <= endDate.getFullYear(); year++) {
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const nextMonth = new Date(year, month + 1, 1);

      // Stop if we go beyond the current month
      if (startDate >= endDate) break;

      // Get stats for the current month
      const stats = await getStatsForMonth(startDate, nextMonth);
      results.push({
        Month: startDate.toLocaleString('default', { month: 'long' }),
        Year: year,
        QualifyingTests: stats.qualifyingTests,
        Responses: stats.qualifyingTestResponses,
      });
    }
  }

  // Generate CSV content
  let csvContent = 'Month,Year,QualifyingTests,Responses\n';
  results.forEach(row => {
    csvContent += `${row.Month},${row.Year},${row.QualifyingTests},${row.Responses}\n`;
  });

  // Write CSV to a file
  fs.writeFileSync('Monthly_Stats.csv', csvContent);

  console.log('CSV file created: Monthly_Stats.csv');
  app.delete();
};

main()
  .catch((error) => {
    console.error(error);
    app.delete();
    process.exit();
  });
