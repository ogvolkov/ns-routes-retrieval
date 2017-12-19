
const { MongoClient } = require('mongodb');

const { NsApi } = require('./nsApi');

const { Database } = require('./database');

const { Retrieval } = require('./retrieval');

const usageNotice = `
NS routes retriever
Usage:
  node app.js stations        retrieve stations
  node app.js routes          retrieve routes
Required environment variables:
  DB_CONNECTION               MongoDB connection for the target database
  NS_USER                     NS API user
  NS_PASSWORD                 NS API password
`;

function main() {
  const databaseConnection = process.env.DB_CONNECTION;
  const nsUser = process.env.NS_USER;
  const nsPassword = process.env.NS_PASSWORD;

  if (!databaseConnection || !nsUser || !nsPassword) {
    console.log(usageNotice);
    process.exit(1);
  }

  function doImport(continuation) {
    const nsApi = new NsApi(nsUser, nsPassword);

    MongoClient.connect(databaseConnection)
      .then((mongoDb) => {
        const database = new Database(mongoDb);
        const retrieval = new Retrieval(nsApi, database);
        continuation(retrieval);
      })
      .catch(err => console.log(`Error ${err}`));
  }

  switch (process.argv[2]) {
    case 'stations':
      console.log('retrieving stations');
      doImport(retrieval => retrieval.importStations());
      break;

    case 'routes':
      console.log('retrieving routes');
      doImport(retrieval => retrieval.retrieveRoutes());
      break;

    default:
      console.log(usageNotice);
      process.exit(2);
  }
}

main();
