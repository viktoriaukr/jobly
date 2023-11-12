'use strict';
const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs
                (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle `,
      [title, salary, equity, company_handle]
    );
    return result.rows[0];
  } 

  static async findAll(filters = {}) {
    let query = `SELECT j.id,
                        j.title, 
                        j.salary, 
                        j.equity, 
                        j.company_handle,
                        c.name
                FROM jobs j
                LEFT JOIN companies AS c ON c.handle = j.company_handle`;

    const { title, minSalary, hasEquity } = filters;
    let value = [];
    let where = [];

    if (title) {
      value.push(`%${title}%`);
      where.push(`title ILIKE $${value.length}`);
    }

    if (minSalary !== undefined) {
      value.push(minSalary);
      where.push(`salary >= $${value.length}`);
    }

    if (hasEquity === true) {
      where.push(`equity > 0`);
    }

    if (where.length > 0) {
      query += ` WHERE ` + where.join(` AND `);
    }

    query += ` ORDER BY title`;
    const result = await db.query(query, value);
    return result.rows;
  }

  static async get(id) {
    const jobsRes = await db.query(
      `SELECT  id,
                title,
                salary,
                equity,
                company_handle
        FROM jobs
        WHERE id = $1`,
      [id]
    );
    const job = jobsRes.rows[0];
    if (!job) {
      throw new NotFoundError(`No job found for ${id}`);
    }
    const handle = job.company_handle;
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );
    delete job.company_handle;
    job.company = companyRes.rows[0];
    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const handleVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${handleVarIdx}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job found with id of ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE 
          FROM jobs
          WHERE id = $1
          RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job found with id of ${id}`);
  }
}

module.exports = Job;
