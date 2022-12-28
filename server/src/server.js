const http = require("http");
const app = require("./app");
const { mongoConnect } = require("./services/mongo");
const { loadPlanetsData, l } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`app is listening on port ${PORT}`);
  });
}

startServer();
