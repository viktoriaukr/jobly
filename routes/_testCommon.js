"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/jobs");
const { createToken } = require("../helpers/tokens");

const testJobsIds = [];
async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  await Company.create({
    handle: "c1",
    name: "C1",
    numEmployees: 1,
    description: "Desc1",
    logoUrl: "http://c1.img",
  });
  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description: "Desc2",
    logoUrl: "http://c2.img",
  });
  await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description: "Desc3",
    logoUrl: "http://c3.img",
  });

  testJobsIds[0] = (
    await Job.create({
      title: "j1",
      salary: 100,
      equity: "0.3",
      company_handle: "c1",
    })
  ).id;

  testJobsIds[1] = (
    await Job.create({
      title: "j2",
      salary: 200,
      equity: "0.5",
      company_handle: "c1",
    })
  ).id;

  testJobsIds[2] = (
    await Job.create({
      title: "j3",
      salary: 500,
      equity: "0.7",
      company_handle: "c1",
    })
  ).id;

  testJobsIds[3] = (
    await Job.create({
      title: "j4",
      salary: 50,
      equity: "0",
      company_handle: "c1",
    })
  ).id;

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await User.jobApplication("u1", testJobsIds[0]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const admin = createToken({ username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobsIds,
  u1Token,
  u2Token,
  admin,
};
