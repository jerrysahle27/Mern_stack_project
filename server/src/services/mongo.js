const mongoose = require("mongoose");

const MONGO_URL =
  "mongodb+srv://nasa-api:GMhxF2fx2KYaZip4@cluster0.he1h6lz.mongodb.net/?retryWrites=true&w=majority";
mongoose.connection.once("open", () => [
  console.log("MongoDb connection ready"),
]);
mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
    useUnifiedTopology: true,
  });
}
 async function mongoDiscount(){
    await mongoose.disconnect();
 }
module.exports = {
  mongoConnect,
  mongoDiscount
};
