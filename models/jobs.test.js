"use strict";
const db = require("../db.js");
const { NotFoundError, BadRequestError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobsIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 100,
    equity: "0.3",
    company_handle: "c1",
  };

  test("works", async () => {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 100,
      equity: "0.3",
      company_handle: "c1",
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async () => {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: jobsIds[0],
        title: "j1",
        salary: 22,
        equity: "0.5",
        company_handle: "c1",
        name: "C1",
      },
      {
        id: jobsIds[1],
        title: "j2",
        salary: 2,
        equity: "0",
        company_handle: "c1",
        name: "C1",
      },
    ]);
  });
  test("works: with filter by title", async () => {
    let jobs = await Job.findAll({ title: "j1" });
    expect(jobs).toEqual([
      {
        id: jobsIds[0],
        title: "j1",
        salary: 22,
        equity: "0.5",
        company_handle: "c1",
        name: "C1",
      },
    ]);
  });

  test("works: with filter by hasEquity", async () => {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: jobsIds[0],
        title: "j1",
        salary: 22,
        equity: "0.5",
        company_handle: "c1",
        name: "C1",
      },
    ]);
  });

  test("works: with filter by minimal salary", async () => {
    let jobs = await Job.findAll({ minSalary: 1 });
    expect(jobs).toEqual([
      {
        id: jobsIds[0],
        title: "j1",
        salary: 22,
        equity: "0.5",
        company_handle: "c1",
        name: "C1",
      },
      {
        id: jobsIds[1],
        title: "j2",
        salary: 2,
        equity: "0",
        company_handle: "c1",
        name: "C1",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async () => {
    let job = await Job.get(jobsIds[0]);
    expect(job).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      equity: "0.5",
      id: jobsIds[0],
      salary: 22,
      title: "j1",
    });
  });

  test("not found if no such job", async () => {
    try {
      await Job.get(348);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */
describe("update", function () {
  const newJob = {
    title: "New Job",
    salary: 100,
    equity: "0.3",
    company_handle: "c1",
  };
  test("works", async () => {
    let job = await Job.update(jobsIds[0], newJob);
    expect(job).toEqual({
      id: jobsIds[0],
      ...newJob,
    });
  });

  test("not found if no such job", async () => {
    try {
      await Job.update(0, newJob);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async () => {
    try {
      await Job.update(jobsIds[0], {});
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async () => {
    await Job.remove(jobsIds[0]);
    const res = await db.query(`SELECT id FROM jobs WHERE id = ${jobsIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async () => {
    try {
      await Job.remove(0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
