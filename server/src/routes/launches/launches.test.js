const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDiscount } = require("../../services/mongo");
describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  describe("Test GET /launches", () => {
    test("It should return with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-106 f",
      launchDate: "January 4,2028",
    };
    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-106 f",
    };
    test("It should return with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It shouls catch missing required properties", () => {});
    test("It shouls catch invalid date", () => {});
  });

});
