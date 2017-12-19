# NS routes retrieval

NS routes retrieval obtains routes between all pairs of stations operated by Dutch railway (NS). Retrieval is done via the official [NS API](https://www.ns.nl/en/travel-information/ns-api), and results are saved into a MongoDB database.

## Preparation
To run the program, you need to obtain an API key and password from [NS](https://www.ns.nl/ews-aanvraagformulier/).

## Environment variables
The following environment variables should be set:

|Variable|Description|Example|
|--------|-----------|-------|
|DB_CONNECTION|MongoDB connection for the target database|mongodb://localhost/ns-test|
|NS_USER|NS API user|email@example.com|
|NS_PASSWORD|NS API password|Kxr26dPstF9zRbaw|
## Configuration
Configuration is done via `config.js`.
Primarily you would like to configure *departureDate*, date and time for which the routes will be requested.

Note that NS limits a number of daily API calls (currently it's 50000). To prevent API abuse, the program will stop once it reaches that request amount.

## Geting stations
```
node app.js stations
```
All available stations will be retrieved and saved into the `stations` collection in the database.

## Getting routes matrix
```
node app.js routes
```
Routes between each pair of distinct stations are retrieved and saved into the `routeAdvice` collection in the database.

This command expects that the stations are already retrieved.

It stops when reaching daily usage quotas.

When restarting, it will continue retrieving routes it hasn't retrieved before.