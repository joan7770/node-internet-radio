import { getIcecastStation } from './lib/icecast';
import { getShoutcastV1Station, getShoutcastV2Station } from './lib/shoutcast';
import { getStreamStation } from './lib/icystream';
import { StreamSource } from './lib/StreamSource';
import { Station } from './lib/Station';

export { StreamSource, Station };

export function getStationInfo(url: string, callback: (error: any, station?: Station) => void, method?: string) {
  let methodHandler;

  switch (method) {
    case StreamSource.SHOUTCAST_V1:
      methodHandler = getShoutcastV1Station;
      break;
    case StreamSource.SHOUTCAST_V2:
      methodHandler = getShoutcastV2Station;
      break;
    case StreamSource.ICECAST:
      methodHandler = getIcecastStation;
      break;
    case StreamSource.STREAM:
      methodHandler = getStreamStation;
      break;
    default:
  }

  // If we have a specific method to fetch from then
  // attempt only that.
  if (methodHandler) {
    return methodHandler(url, callback);
  }

  // Resolve the promise from the async function and return the station with the callback
  // We shouldnt mix callbacks and promises but for backwards compatability I am breaking
  // the law here......
  return findStation(url)
    .then(station => {
      return callback(null, station);
    })
    .catch(err => {
      return callback(err);
    });

  /**
  @params {string} url of given stream
  @returns {Promise<Station | undefined>} (object if successful, undefined if error)
  */
  async function findStation(url: string): Promise<Station | undefined> {
    let results = await V2(url);
    // Find which provider has our station
    if (!results) {
      results = await V1(url);
    }
    if (!results) {
      results = await Ice(url);
    }
    if (!results) {
      results = await Icy(url);
    }
    return results;

    //====================================================================================
    //=                  Promise wrapper functions                                       =
    //====================================================================================
    function V1(url: string) {
      return new Promise<Station | undefined>((resolve, reject) => {
        try {
          getShoutcastV1Station(url, (error: any, station?: Station) => {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    function V2(url: string) {
      return new Promise<Station | undefined>((resolve, reject) => {
        try {
          getShoutcastV2Station(url, (error: any, station?: Station) => {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    function Icy(url: string) {
      return new Promise<Station | undefined>((resolve, reject) => {
        try {
          getStreamStation(url, (error: any, station?: Station) => {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    function Ice(url: string) {
      return new Promise<Station | undefined>((resolve, reject) => {
        try {
          getIcecastStation(url, (error: any, station?: Station) => {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }
}