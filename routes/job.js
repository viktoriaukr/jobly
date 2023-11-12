"use strict";
const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */
router.post("/", ensureIsAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (error) {
    return next(error);
  }
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle, name (companyName)}, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - hasEquity
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
  try {
    const q = req.query;
    if (q.minSalary !== undefined) {
      q.minSalary = +q.minSalary;
    }
    q.hasEquity = q.hasEquity === "true";
    const jobs = await Job.findAll(q, jobSearchSchema);
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, company_handle}
 *   where company is [{ handle, name, description, numEmployees, logoUrl, jobs  }, ...]
 *
 * Authorization required: none
 */
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => {job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureIsAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */
router.delete("/:id", ensureIsAdmin, async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
