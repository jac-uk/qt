'use strict';

const config = require('./shared/config.js');
const { app, db } = require('./shared/admin.js');
const { getDocuments, getAllDocuments, formatDate } = require('../functions/shared/helpers');

// function flattenArrayProperty(data, prop, formatter) {
//   if (!data) {
//     return '';
//   }
//   return data.map((item) => {
//     if (typeof formatter !== 'undefined') {
//       return formatter(item[prop]);
//     } else {
//       return item[prop];
//     }
//   }).join(', ');
// }

function upperCase(value) {
  if (value) {
    return value.toUpperCase();
  }
  return value;
}

function flattenQualifications(data) {
  if (!data) {
    return '';
  }
  return data.map((item) => {
    if (item.type === 'barrister' && item.qualificationNotComplete) {
      return `${upperCase(item.type)}\n${item.details}`;
    } else {
      return `${upperCase(item.type)}\n${formatDate(item.date)}`;
    }
  }).join('\n\n');
}

function flattenCharacterInformation(data) {
  if (!data) {
    return '';
  }
  const issues = [];
  Object.entries(config.APPLICATION.CHARACTER_ISSUES).forEach(([key, value]) => {
    if (data[key]) {
      const details = data[value.details].map(detail => {
        return `${formatDate(detail.date)} ${detail.title ? detail.title : ''}\n${detail.details}`;
      }).join('\n\n');
      issues.push(`${value.title.toUpperCase()}\n${details}`);
    }
  });
  return issues.join('\n\n');
}

const main = async () => {

  const exerciseId = 'fgQ7Uw3sLseDPk5ike5p';

  // get data
  const applicationRecords = await getDocuments(
    db.collection('applicationRecords')
    .where('exercise.id', '==', exerciseId)
    .where('status', '==', 'passedScenarioTest')
    .select()
  );
  const applicationIds = applicationRecords.map(item => item.id);
  const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
  const applications = await getAllDocuments(db, applicationRefs);

  const filteredData = applications;

  // row data
  const rows = [];
  filteredData.forEach(application => {
    const row = {
      referenceNumber: application.referenceNumber,
      fullName: application.personalDetails.fullName,
      email: application.personalDetails.email,
      citizenship: application.personalDetails.citizenship,
      dateOfBirth: formatDate(application.personalDetails.dateOfBirth),
      qualifications: flattenQualifications(application.qualifications),
      character: flattenCharacterInformation(application.characterInformation),
    };
    rows.push(row);
  });

  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const headers = [
    { id: 'referenceNumber', title: 'Ref' },
    { id: 'fullName', title: 'Name' },
    { id: 'email', title: 'Email' },
    { id: 'citizenship', title: 'Citizenship' },
    { id: 'dateOfBirth', title: 'Date of Birth' },
    { id: 'qualifications', title: 'Qualifications' },
    { id: 'character', title: 'Character' },
  ];
  const output = createCsvWriter({
    path: 'output.csv',
    header: headers,
  });
  await output.writeRecords(rows);

  return rows.length;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
