const config = require("../config/config.json");
const axios = require("./httpService");
const apiUrl = config.binance.apiUrl;

let group = {
  "BNB markets": ["BNB"],
  "BTC markets": ["BTC"],
  "ALTS markets": ["ETH", "TRX", "XRP"],
  // prettier-ignore
  "FIAT markets": ["USDT", "BUSD", "BRL", "AUD", "BIDR", "EUR", "GBP", "RUB", "TRY", "TUSD", "USDC", "DAI", "IDRT", "PAX", "UAH", "NGN", "VAI", "BVND"],
  ETF: ["USDT"],
  allQuotes: [
    "BNB",
    "BTC",
    "ETH",
    "TRX",
    "XRP",
    "USDT",
    "BUSD",
    "BRL",
    "AUD",
    "BIDR",
    "EUR",
    "GBP",
    "RUB",
    "TRY",
    "TUSD",
    "USDC",
    "DAI",
    "IDRT",
    "PAX",
    "UAH",
    "NGN",
    "VAI",
    "BVND",
  ],
};

async function getTradableCoins() {
  const { data } = await axios.get(apiUrl + "/exchangeInfo");
  let tradablePairs = data.symbols.filter((item) => {
    return item.status === "TRADING";
  });
  let coinsData = {};
  group.allQuotes.forEach((quote) => {
    coinsData[quote] = [];
  });

  tradablePairs.forEach((item) => {
    coinsData[item.quoteAsset].push(item.baseAsset);
  });
  return coinsData;
}

module.exports = {
  getTradableCoins,
};
