// Dont forget to create the database biztime_test, and seed the test data by running: psql < test-data.sql   while inside the tests folder
// NOTE. You will need to run each test file individually to avoid DB conflicts. Do this by using: jest filename.test.js
// NOTE 2. All these tests worked before I did the extra steps after in the further study. I did not want to spend any further time on this project, so some of the tests may not work.

// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

// Require the testing framework, the express app, and our database
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

// Var to hold our test company for easy access to properties
let testCompany;

// Run before each test
beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.')
  RETURNING code, name, description`);
  testCompany = result.rows[0]
  
})

// Run after each test
afterEach(async () => {
  await db.query(`DELETE FROM companies`)
})

// Run after all tests are finished
afterAll(async () => {
  await db.end()
})

describe("GET /companies", () => {
    test("Get a list with all companies", async () => {
        const res = await request(app).get("/companies");
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies : [testCompany]});
    })
})

describe("GET /companies/code", () => {
    test("Get a single company using the company code", async () => {
        const res = await request(app).get("/companies/apple");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies : testCompany});
    })
})

describe("POST/companies", () => {
    test("Creates a single company", async () => {
        let newCompany = {code : "chevy", name : "chevrolet", description : "American Automobile manufacturer"};
        const res = await request(app).post("/companies").send(newCompany);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({companies : newCompany});
    })
})

describe("PUT /companies/:code", () => {
    test("Updates the matching company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({name : "Chevron", description : "A gas company"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: {code : testCompany.code, name : "Chevron", description : "A gas company"}});
    })
})

describe("DELETE /companies/:code", () => {
    test("Deletes the matching company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message : `Sucessfully deleted}`});
    })
})