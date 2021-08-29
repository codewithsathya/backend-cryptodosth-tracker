function mapDataToDocuments(allCoinsCandles, coinsArr, CombinedCandles) {
  try {
    let length = allCoinsCandles[0].length;
    let documentsArr = [];
    for (let i = 0; i < length; i++) {
      let data = [];
      for (let j = 0; j < coinsArr.length; j++) {
        let obj = {};
        obj.name = coinsArr[j];
        if (!allCoinsCandles[j][i]) {
          console.log(coinsArr[j], i);
          continue;
        }
        obj.open = parseFloat(allCoinsCandles[j][i][1]);
        obj.close = parseFloat(allCoinsCandles[j][i][4]);
        data.push(obj);
      }
      let doc = new CombinedCandles({
        time: allCoinsCandles[0][i][0],
        data,
      });
      documentsArr.push(doc);
    }
    return documentsArr;
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = mapDataToDocuments;
