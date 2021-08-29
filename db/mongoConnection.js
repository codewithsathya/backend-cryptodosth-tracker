const mongoose = require("mongoose");
const debug = require("debug")("cryptodosth:testing");

mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => debug("Connection error"));
db.on("open", () => debug("Connected to database"));

const combinedCandleSchema = new mongoose.Schema({
  time: Number,
  data: Array,
});

const CombinedCandles = mongoose.model(
  "1m_combinedCandles",
  combinedCandleSchema
);

module.exports = {
  CombinedCandles,
};
