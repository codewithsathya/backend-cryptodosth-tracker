const MongoClient = require("mongodb").MongoClient;

let uri = "mongodb+srv://ritesh:8127@cluster0.ey1dg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
let dbName = "myFirstDatabase";
MongoClient.connect(uri, (err, db) => {
	if(err) throw err;
  let dbo = db.db(dbName);
  db.close();
})

MongoClient.connect(uri, async (err, db) => {
  if(err) throw err;
  let dbo = db.db(dbName);
  dbo.collection("1m_combinedcandles").find({}, {time: 1, _id:0}).toArray((err, res) => {
    let arr = res.map(obj => {
      return obj.time;
    })
    let firstTime = new Date(arr[999]).toISOString();
    console.log(firstTime);
    db.close();
  });
})