const { config } = require('./config');

const { GraphTraversal } = require('./graphTraversal');

const { RateLimiter, rateLimitErrorMessage } = require('./rateLimiter');

const { NsApi } = require('./nsApi');

class Retrieval {
  constructor(nsApi, db) {
    this.nsApi = nsApi;
    this.db = db;
  }

  retrieveRoute(route, rateLimiter) {
    const routeName = `route from ${route.from} to ${route.to}`;
    console.log(`requesting ${routeName}`);

    const { departureDate } = config;
    const departureDateIso = departureDate.toISOString();

    return rateLimiter
      .execute(() => this.nsApi.retrieveRouteAdvice(route.from, route.to, departureDateIso))
      .then(routeAdvice => this.db.saveRouteAdvice(route, departureDate, routeAdvice))
      .catch((error) => {
        if (error.message === rateLimitErrorMessage) {
          console.log('Rate limit reached');
          process.exit();
        } else {
          console.log(error.error);

          NsApi.extractErrorFromResponse(error.error)
            .then((innerError) => {
              console.log(innerError);
              this.db.saveRouteError(route, departureDate, error, innerError);
            })
            .catch((unexpectedError) => {
              console.error(unexpectedError);
              this.db.saveRouteError(route, departureDate, error);
            });
        }
      });
  }

  startRouteRetrieval(rateLimiter, alreadyRetrievedRoutes, stationCodes) {
    const stationCodeToIndex = stationCodes.reduce(
      (map, station, index) => map.set(station, index),
      new Map(),
    );

    const edges = alreadyRetrievedRoutes.map(route => ({
      from: stationCodeToIndex.get(route.from),
      to: stationCodeToIndex.get(route.to),
    }));

    const traversal = new GraphTraversal(stationCodes.length, edges);

    setInterval(() => {
      const edge = traversal.getNextUnvisitedEdge();

      if (edge !== null) {
        const from = stationCodes[edge.from];
        const to = stationCodes[edge.to];
        this.retrieveRoute({ from, to }, rateLimiter);
      } else {
        console.log('All routes retrieved');
        process.exit();
      }
    }, config.routeRequestDelay);
  }

  static getCurrentDate() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }

  retrieveRoutesWithRateLimiting(currentRequestCount) {
    console.log(`today's request count: ${currentRequestCount}`);

    const rateLimiter = new RateLimiter(
      currentRequestCount,
      config.dailyApiLimit,
      Retrieval.getCurrentDate,
      (value, period) => this.db.setRequestCount(period, value),
    );

    return this.db.getAvailableConnections()
      .then(alreadyRetrievedRoutes => this.db.getStationCodes()
        .then(stationCodes =>
          this.startRouteRetrieval(rateLimiter, alreadyRetrievedRoutes, stationCodes)));
  }

  retrieveRoutes() {
    this.db.getRequestCount(Retrieval.getCurrentDate())
      .then(requestCount => this.retrieveRoutesWithRateLimiting(requestCount));
  }

  importStations() {
    this.nsApi.retrieveStations()
      .then(stations => stations.forEach(station => this.db.saveStation(station)));
  }
}

module.exports = { Retrieval };
