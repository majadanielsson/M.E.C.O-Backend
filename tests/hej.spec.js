// we will use supertest to test HTTP requests/responses
// we also need our app for the correct routes!
const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);

jest.setTimeout(10000);
describe.only("GET /courses", function () {
  it("should respond with HTTP 400 for missing userId", function (done) {
    request.get("/courses/").expect(400, done);
  });
  it("should respond with HTTP 200 with userId", function (done) {
    request.get("/courses/5SD003").expect(200, done);
  });
});
/*
it("gets the test endpoint", async (done) => {
  const response = await request.get("/courses/5SD003");
  expect(response.status).toBe(200);
  done();
});
it("gets the test endpoint", async (done) => {
  const response = await request.get("/courses/1MA194");
  expect(response.status).toBe(200);
  done();
});
it("should respond with HTTP 400 for missing userId", function (done) {
  request(app).get("/courses").expect(400, done);
});
*/
/*
// This test fails because 1 !== 2
it("Testing to see if Jest works", () => {
  expect(1).toBe(2);
});
*/
