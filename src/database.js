
class Database {
  constructor(mongoDb) {
    this.mongoDb = mongoDb;
  }

  saveRouteAdvice(direction, departureDate, routeAdvice) {
    const dataToSave = {
      from: direction.from,
      to: direction.to,
      departureDate,
      advice: routeAdvice,
      retrievalDate: new Date(),
    };

    const name = `route between ${direction.from} to ${direction.to}`;

    return this.mongoDb.collection('routeAdvice')
      .insertOne(dataToSave)
      .then(() => console.log(`saved ${name}`))
      .catch(error => console.error(`couldn't save ${name} ${error}`));
  }

  saveRouteError(direction, departureDate, error, innerError) {
    const dataToSave = {
      from: direction.from,
      to: direction.to,
      departureDate,
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
      retrievalDate: new Date(),
    };

    if (innerError) {
      dataToSave.innerError = innerError;
    }

    const name = `route between ${direction.from} to ${direction.to}`;

    return this.mongoDb.collection('routeAdvice')
      .insertOne(dataToSave)
      .then(() => console.log(`saved retrieval error for ${name}`))
      .catch(saveError => console.error(`couldn't save retrieval error for ${name} ${saveError}`));
  }

  getAvailableConnections() {
    return this.mongoDb.collection('routeAdvice')
      .find({}, { from: 1, to: 1, _id: 0 })
      .toArray();
  }

  getStationCodes() {
    return this.mongoDb.collection('stations')
      .find({}, { Code: 1, _id: 0 })
      .toArray()
      .then(stations => stations.map(it => it.Code));
  }

  saveStation(station) {
    const stationDb = station;
    stationDb.retrievalDate = new Date();
    const stationName = station.Namen.Lang;

    return this.mongoDb.collection('stations').insertOne(station)
      .then(() => console.log(`saved station ${stationName}`))
      .catch(error => console.error(`couldn't save station ${stationName} ${error}`));
  }

  getRequestCount(date) {
    return this.mongoDb.collection('requestCount')
      .findOne({ date }, { count: 1, _id: 0 })
      .then(it => (it ? it.count : 0));
  }

  setRequestCount(date, value) {
    return this.mongoDb.collection('requestCount')
      .update({ date }, { $set: { count: value } }, { upsert: true });
  }
}

module.exports = { Database };
