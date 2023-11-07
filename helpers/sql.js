const { BadRequestError } = require("../expressError");

// This function is used to generate a SQL query for performing a partial update on a database table.

/** Firstly we are getting keys from the "dataToUpdate" and creating an array of keys.
 * 
 If we have an object: 
    {firstName: 'Aliya', age: 32}, 
 we will create an array of keys: 
    ['firstName', 'age'].

 Also this function will check if there are no existing keys in the given object and return an error if there are no given keys.

 After we made sure we have an array of keys, we will map through them and create an array of keys-value pairs strings where key is replaced by jsToSql[colName] and value is corresponding to the index:
    ['"first_name"=$1', '"age"=$2'].
 
If jsToSql[colName] is not provided, we will just use the original key that was given:

    `{firstName: 'Aliya', age: 32}`, 
    cols will be: 
    `['"firstName"=$1', '"age"=$2']`

Lastly we return an object with 2 properties: setCols and values.
     setCols will contain created array joined by comma,
     values will contain an array of values extracted from dataToUpdate. This values correspond to the data that will be used to update specified columns in the database.
**/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
