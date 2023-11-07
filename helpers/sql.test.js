const { sqlForPartialUpdate } = require("./sql");

describe("testing a function that generates sql data for partial updates", () => {
  test("should generate an object with the correct values", () => {
    const res = sqlForPartialUpdate(
      { firstName: "Aliya", age: 32 },
      {
        firstName: "first_name",
        age: "age",
      }
    );
    expect(res).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });
});
