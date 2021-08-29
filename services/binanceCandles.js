const axios = require("./httpService");
const getTimeFrameInMilliseconds = require("../utils/getTimeFrameInMilliseconds");
const config = require("../config/config.json");
const debug = require("debug")("cryptodosth:testing");

const apiUrl = config.binance.apiUrl;
const candlesPerRequest = config.binance.candlesPerRequest;

function getKlinesApiUrl(
  symbol,
  timeFrame,
  startTimeInMilliseconds,
  endTimeInMilliseconds
) {
  return `${apiUrl}/klines?symbol=${symbol}&interval=${timeFrame}&startTime=${startTimeInMilliseconds}&endTime=${endTimeInMilliseconds}&limit=1000`;
}

//get candles functions
async function getLimitedCandles(
  symbol,
  timeFrame,
  startTimeInMilliseconds,
  endTimeInMilliseconds
) {
  const { data: candles } = await axios.get(
    getKlinesApiUrl(
      symbol,
      timeFrame,
      startTimeInMilliseconds,
      endTimeInMilliseconds
    )
  );
  return candles;
}

async function getCandles(
  symbol,
  timeFrame,
  startTime,
  endTime,
  extraCandles = 0
) {
  let milliseconds = getTimeFrameInMilliseconds(timeFrame);
  let endTimeInMilliseconds = new Date(endTime).getTime();
  let startTimeInMilliseconds =
    new Date(startTime).getTime() - extraCandles * milliseconds;
  endTimeInMilliseconds =
    Math.floor(endTimeInMilliseconds / milliseconds) * milliseconds;

  let noOfCandles =
    (endTimeInMilliseconds - startTimeInMilliseconds) / milliseconds + 1;

  try {
    if (noOfCandles <= candlesPerRequest) {
      return await getLimitedCandles(
        symbol,
        timeFrame,
        startTimeInMilliseconds,
        endTimeInMilliseconds
      );
    } else {
      let candles = [];
      let partition = 0;
      while (partition + candlesPerRequest < noOfCandles) {
        candles = [
          ...candles,
          ...(await getLimitedCandles(
            symbol,
            timeFrame,
            startTimeInMilliseconds + partition * milliseconds,
            startTimeInMilliseconds +
              (partition + candlesPerRequest - 1) * milliseconds
          )),
        ];
        partition += candlesPerRequest;
      }
      candles = [
        ...candles,
        ...(await getLimitedCandles(
          symbol,
          timeFrame,
          startTimeInMilliseconds + partition * milliseconds,
          endTimeInMilliseconds
        )),
      ];
      return candles;
    }
  } catch (error) {
    console.log(error);
  }
}

function getLatestCandles(symbol, timeFrame, noOfCandles) {
  let endTime = new Date().getTime();
  let milliseconds = getTimeFrameInMilliseconds(timeFrame);

  let endTimeInMilliseconds = Math.floor(endTime / milliseconds) * milliseconds;
  let startTimeInMilliseconds =
    endTimeInMilliseconds - (noOfCandles - 1) * milliseconds;
  return getCandles(
    symbol,
    timeFrame,
    startTimeInMilliseconds,
    endTimeInMilliseconds
  );
}

async function getLastCandle(symbol, timeFrame, requestedTime) {
  let endTime = requestedTime ? requestedTime : new Date().getTime();
  let timeFrameInMillisec = getTimeFrameInMilliseconds(timeFrame);

  let endTimeInMilliseconds =
    Math.floor(endTime / timeFrameInMillisec) * timeFrameInMillisec;
  return getCandles(
    symbol,
    timeFrame,
    endTimeInMilliseconds,
    endTimeInMilliseconds
  );
}

async function getLastCompleteCandles(
  symbol,
  timeFrame,
  timeRequested,
  noOfCandles
) {
  let timeFrameInMillisec = getTimeFrameInMilliseconds(timeFrame);
  let timeNow = new Date().getTime();
  timeRequested = timeRequested ? timeRequested : timeNow;
  if (noOfCandles === 0) return [];
  noOfCandles = noOfCandles ? noOfCandles : candlesPerRequest;
  let endTime =
    (Math.floor(timeRequested / timeFrameInMillisec) - 1) * timeFrameInMillisec;
  let startTime = endTime - (noOfCandles - 1) * timeFrameInMillisec;
  return await getLimitedCandles(symbol, timeFrame, startTime, endTime);
}

async function show() {
  try {
    let candles = await getLastCompleteCandles("BTCUSDT", "1m");
    console.log(candles.length);
  } catch (error) {
    console.error(error.message);
  }
}

show();

module.exports = {
  getLastCandle,
  getLatestCandles,
  getLastCompleteCandles,
};
