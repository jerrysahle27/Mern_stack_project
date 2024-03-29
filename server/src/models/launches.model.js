const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27,2030"),
  target: "Kepler-442 b",
  customer: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};
saveLaunch(launch);

async function getAllLaunches() {
  return await launchesDatabase.find({}, { '_id': 0, '__v': 0 })

}
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded");
    return;
  } else {
    populateLaunches();
  }
}
async function populateLaunches() {
  console.log("Downloading Launch data....");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}
async function existsLaunchwithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}
async function saveLaunch(launch) {
  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}
async function scheduleNewLaunch() {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching Planet Found ");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );
  return aborted.ok === 1 && aborted.nmodified === 1;
}
module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchwithId,
  abortLaunchById,
};
