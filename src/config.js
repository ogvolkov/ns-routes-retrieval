const config = {};

// delay between requesting routes via NS API
config.routeRequestDelay = 1000;

// maximum allowed NS API requests per day
config.dailyApiLimit = 49000;

// departure date and time for route retrieval
// note months are zero-based
config.departureDate = new Date(Date.UTC(2017, 11, 4, 6, 30));

module.exports = { config };
