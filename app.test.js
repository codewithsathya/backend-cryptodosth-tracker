const express = require("express");
const env = require("dotenv").config();
const axios = require("./services/httpService");
const debug = require("debug")("cryptodosth");
const { CombinedCandles } = require("./db/mongoConnection");
const {
  getLatestCandles,
  getLastCompleteCandles,
} = require("./services/binanceCandles");
const { getTradableCoins } = require("./services/otherBinanceMethods");
const mapDataToDocuments = require("./utils/mapDataToDocuments");
const getTimeFrameInMilliseconds = require("./utils/getTimeFrameInMilliseconds");

const app = express();

let coinsArr = [];
let quotes = "USDT";

async function setCoins() {
  let tradableCoins = await getTradableCoins();
  coinsArr = [...tradableCoins[quotes]];
}

async function getAllCoinsCandlesAsync(requestedTime, noOfCandles, timeFrame) {
  let count = 0;
  let candlesData = [];
  for (let coin of coinsArr) {
    let data = await getLastCompleteCandles(
      coin + quotes,
      timeFrame,
      requestedTime,
      noOfCandles
    );
    debug(
      `Api called - ${coin} - ${((++count / coinsArr.length) * 100).toFixed(
        2
      )}%`
    );
    candlesData.push(data);
  }
  return candlesData;
}

async function getAllCoinsCandles(requestedTime, noOfCandles, timeFrame) {
  let candlesData = coinsArr.map((coin) => {
    try {
      return getLastCompleteCandles(
        coin + quotes,
        timeFrame,
        requestedTime,
        noOfCandles
      );
    } catch (err) {
      debug(err);
    }
  });
  return Promise.all(candlesData);
}

function floorTime(time, timeFrame) {
  let ms = getTimeFrameInMilliseconds(timeFrame);
  return Math.floor(time / ms) * ms;
}


let loopStartTime = 0;
let delay = 500;
function startMachine(){
  let now = new Date().getTime();
  loopStartTime = floorTime(now + getTimeFrameInMilliseconds("1m"), "1m");
  let millis = loopStartTime - now;
  setTimeout(() => repeat(), millis);
}


function repeat(){
  putAndDelete();
  loopStartTime += getTimeFrameInMilliseconds("1m");
  let millis = loopStartTime - new Date().getTime();
  setTimeout(repeat, millis);
}

async function putAndDelete(){
  let timeNow = new Date().getTime();
  let doc = mapDataToDocuments(await getAllCoinsCandles(timeNow, 1, "1m"), coinsArr, CombinedCandles);
  await CombinedCandles.insertMany(doc);
  await deleteExtraFrontCandles(1, timeNow);
  debug("Updated", timeNow)
}

async function initialize() {
  let startTime, endTime;
  await setCoins();
  await CombinedCandles.deleteMany().then(() => {
    debug("Deleted", new Date().toTimeString());
    startTime = new Date().getTime();
  });
  let docsArr = mapDataToDocuments(
    await getAllCoinsCandlesAsync(startTime, 1000, "1m"),
    coinsArr,
    CombinedCandles
  );
  await CombinedCandles.insertMany(docsArr).then(() => {
    debug("Inserted Candles", new Date().toTimeString());
    endTime = new Date().getTime();
  });
  debug(docsArr.length);
  let extraCandlesRequired =
    (floorTime(endTime, "1m") - floorTime(startTime, "1m")) /
    getTimeFrameInMilliseconds("1m");
  if(extraCandlesRequired !== 0){
    let remainingDocs = mapDataToDocuments(
      await getAllCoinsCandles(endTime, extraCandlesRequired, "1m"),
      coinsArr,
      CombinedCandles
    );
    await CombinedCandles.insertMany(remainingDocs).then(() => {
      debug("Server is ready to use", new Date().toTimeString());
    });
    await deleteExtraFrontCandles(extraCandlesRequired, endTime).then(() => {
      console.log(endTime);
    });
  }
  startMachine();
}

async function deleteExtraFrontCandles(extraCandlesRequired, endTime){
  let frontTime = floorTime(endTime, "1m") - 1000 * getTimeFrameInMilliseconds("1m");
  await CombinedCandles.deleteMany({time: { $lt : frontTime }});
  debug("Delete front");
}

initialize();

module.exports = app;
