"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobsIds,
  admin,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works for admins", async () => {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        title: "New Job",
        salary: 100,
        equity: "0.3",
        company_handle: "c1",
      })
      .set("authorization", `Bearer ${admin}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 100,
        equity: "0.3",
        company_handle: "c1",
      },
    });
  });
  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post(`/jobs`)
      .send({})
      .set("authorization", `Bearer ${admin}`);
    expect(resp.statusCode).toEqual(400);
  });
  test("bad request with invalid data", async () => {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        title: "New Job",
        salary: "bad value",
        equity: "4.0",
        company_handle: "c1",
      })
      .set("authorization", `Bearer ${admin}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized for not admin", async () => {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        title: "New Job",
        salary: 100,
        equity: "0.3",
        company_handle: "c1",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works for anyone", async () => {
    const resp = await request(app).get("/jobs");
    expect(resp.body.jobs).toEqual([
      {
        id: testJobsIds[0],
        title: "j1",
        salary: 100,
        equity: "0.3",
        company_handle: "c1",
        name: "C1",
      },
      {
        id: testJobsIds[1],
        title: "j2",
        salary: 200,
        equity: "0.5",
        company_handle: "c1",
        name: "C1",
      },
      {
        id: testJobsIds[2],
        title: "j3",
        salary: 500,
        equity: "0.7",
        company_handle: "c1",
        name: "C1",
      },
      {
        id: testJobsIds[3],
        title: "j4",
        salary: 50,
        equity: "0",
        company_handle: "c1",
        name: "C1",
      },
    ]);
  });
  test("search by title", async () => {
    const resp = await request(app).get("/jobs").query({ title: "j2" });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 200,
          equity: "0.5",
          company_handle: "c1",
          name: "C1",
        },
      ],
    });
  });
  test("search by minSalary", async () => {
    const resp = await request(app).get("/jobs").query({ minSalary: 150 });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 200,
          equity: "0.5",
          company_handle: "c1",
          name: "C1",
        },
        {
          id: testJobsIds[2],
          title: "j3",
          salary: 500,
          equity: "0.7",
          company_handle: "c1",
          name: "C1",
        },
      ],
    });
  });
  test("search by hasEquity", async () => {
    const resp = await request(app).get("/jobs").query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobsIds[0],
          title: "j1",
          salary: 100,
          equity: "0.3",
          company_handle: "c1",
          name: "C1",
        },
        {
          id: testJobsIds[1],
          title: "j2",
          salary: 200,
          equity: "0.5",
          company_handle: "c1",
          name: "C1",
        },
        {
          id: testJobsIds[2],
          title: "j3",
          salary: 500,
          equity: "0.7",
          company_handle: "c1",
          name: "C1",
        },
      ],
    });
  });
  test("fails: test next() handler", async () => {
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for all users", async () => {
    const resp = await request(app).get(`/jobs/${testJobsIds[2]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobsIds[2],
        title: "j3",
        salary: 500,
        equity: "0.7",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for no such job", async () => {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toBe(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", () => {
  test("works for admins", async () => {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[1]}`)
      .send({ title: "new", salary: 2000, equity: "0.8" })
      .set("authorization", `Bearer ${admin}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobsIds[1],
        title: "new",
        salary: 2000,
        equity: "0.8",
        company_handle: "c1",
      },
    });
  });
  test("unauth for anon", async () => {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[1]}`)
      .send({ title: "new", salary: 2000, equity: "0.8" });
    expect(resp.statusCode).toEqual(401);
  });
  test("unauth for non-admin", async () => {
    const resp = await request(app)
      .patch(`/jobs/${testJobsIds[1]}`)
      .send({ title: "new", salary: 2000, equity: "0.8" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async () => {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({ title: "new", salary: 2000, equity: "0.8" })
      .set("authorization", `Bearer ${admin}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async () => {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({ title: "new", salary: "invalid value", equity: "2.8" })
      .set("authorization", `Bearer ${admin}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id*/

describe("DELETE /jobs/:id", function () {
  test("works for admins", async () => {
    const resp = await request(app)
      .delete(`/jobs/${testJobsIds[0]}`)
      .set("authorization", `Bearer ${admin}`);
    expect(resp.body).toEqual({ deleted: `${testJobsIds[0]}` });
  });

  test("unauth for anonymous users", async () => {
    const resp = await request(app).delete(`/jobs/${testJobsIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });
  test("unauth for non-admin users", async () => {
    const resp = await request(app)
      .delete(`/jobs/${testJobsIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
  test("not found for no such job", async () => {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${admin}`);
    expect(resp.statusCode).toEqual(404);
  });
});
