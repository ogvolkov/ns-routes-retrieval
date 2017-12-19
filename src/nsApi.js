const request = require('request-promise');
const querystring = require('querystring');
const xml2js = require('xml2js-es6-promise');
const { processors: { stripPrefix } } = require('xml2js');

const stationsListUrl = 'http://webservices.ns.nl/ns-api-stations-v2';
const travelRecommendationsUrl = 'http://webservices.ns.nl/ns-api-treinplanner';

class NsApi {
  constructor(user, password) {
    this.user = user;
    this.password = password;
  }

  callApi(url) {
    return request({
      uri: url,
      gzip: true,
    }).auth(this.user, this.password);
  }

  static parseStations(xml) {
    return xml2js(xml, { explicitArray: false })
      .then(result => result.Stations.Station);
  }

  retrieveStations() {
    return this.callApi(stationsListUrl).then(NsApi.parseStations);
  }

  static parseRouteAdvice(xml) {
    return xml2js(xml, { explicitArray: false, attrkey: 'attributes' })
      .then(data => data.ReisMogelijkheden.ReisMogelijkheid);
  }

  retrieveRouteAdvice(from, to, datetime) {
    const query = {
      fromStation: from,
      toStation: to,
      dateTime: datetime,
      departure: true,
    };

    const queryString = querystring.stringify(query);
    const url = `${travelRecommendationsUrl}?${queryString}`;

    return this.callApi(url).then(NsApi.parseRouteAdvice);
  }

  static extractErrorFromResponse(error) {
    return xml2js(error, { explicitArray: false, tagNameProcessors: [stripPrefix] })
      .then(soapError => soapError.Envelope.Body.Fault.faultstring);
  }
}

module.exports = { NsApi };
