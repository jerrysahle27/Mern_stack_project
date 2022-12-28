const express = require("express");
const { httpGetAllPlanet } = require("./planets.controller");
const planetsRouter = express.Router();
planetsRouter.get("/planets", httpGetAllPlanet);


module.exports = planetsRouter;
