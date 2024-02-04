const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your/serviceAccountKey.json');
const fs = require('fs').promises;
const papaparse = require('papaparse');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://semester-project-10ee1-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const database = admin.database();

const csvFilePath = 'hamza.csv';

const addDataToFirebase = async () => {
  try {
    const csvData = await fs.readFile(csvFilePath, 'utf-8');
    const jsonData = papaparse.parse(csvData, { header: true }).data;

    const dataRef = database.ref('final');

    jsonData.forEach((item) => {
      dataRef.push(item);
    });

    console.log('Data added to Firebase successfully!');
  } catch (error) {
    console.error('Error adding data to Firebase:', error);
  }
};

addDataToFirebase();
