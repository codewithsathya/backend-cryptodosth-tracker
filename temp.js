MongoClient.connect(uri, (err, db) => {
	if(err) throw err;
  let dbo = db.db(dbName);
  db.close();
})

MongoClient.connect(uri, async (err, db) => {
  // if(err) throw err;
  // let dbo = db.db(dbName);
  // let result = await getLatestCandles(arr[3], "1m", 1000);
  // let obj = result.map(item => {
  //   let i = {};
  //   i.time = item[0];
  //   i.open = item[1];
  //   i.high = item[2];
  //   i.low = item[3];
  //   i.close = item[4];
  //   return i;
  // })
  // dbo.collection("ETH").insertMany(obj, (err, res) => {
  //   if(err) throw err;
  //   debug("Documents inserted");
  //   db.close();
  // })
})


//services
const {
  getLastCandle,
  getLatestCandles,
} = require("./services/binanceCandles");

const app = express();

app.use(express.json());

let arr = ["BTCUSDT", "BNBUSDT", "ADAUSDT", "ETHUSDT"];
let result;

async function show() {
  // result = await getLastCandle(arr[0], "1m");
  result = await getLatestCandles(arr[0], "1m", 1500);
  debug("Loaded candles");
}

app.get("/", async (req, res) => {
  // result = await getLastCandle(arr[0], "1m");
  MongoClient.connect(uri, async (err, db) => {
    if(err) throw err;
    let dbo = db.db("cryptodosth");
    dbo.collection("ETH").find().toArray((err, result) => {
      if(err) throw err;
      res.send(result);
      db.close();
    });
  })
  debug("Connected...");
});