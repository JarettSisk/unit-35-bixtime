// Dont forget to create the database biztime_test, and seed the test data by running: psql < test-data.sql   while inside the tests folder
// NOTE. You will need to run each test file individually to avoid DB conflicts. Do this by using: jest filename.test.js.
// NOTE 2. All these tests worked before I did the extra steps after in the further study. I did not want to spend any further time on this project, so some of the tests may not work.

// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const { json } = require('express');
// Require the testing framework, the express app, and our database
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

// Var to hold our test company for easy access to properties
let testInvoice;

// Run before each test
beforeEach(async () => {
    // Need a company to use for relationship
    await db.query(`INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.')
    RETURNING code, name, description`);
    const result = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null)
    RETURNING *`);
    testInvoice =  result.rows[0]
  
})

// Run after each test
afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
    await db.query("DELETE FROM companies");
})

// Run after all tests are finished
afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    test("Get an array with all invoices", async () => {
        const res = await request(app).get("/invoices");
        // Getting the values we know get returned
        const { comp_code, id } = testInvoice;

        expect(res.status).toBe(200);
        expect(res.body).toEqual({invoices : [{comp_code : comp_code, id : id}]});
    })
})

describe("GET /invoices/:id", () => {
    test("Get the invoice with the matching id", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);

        // JSON would only return the date as a string, so had to convert it back to a date.
        res.body.invoices.add_date = new Date(res.body.invoices.add_date);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({invoices : testInvoice});
    })
})

describe("POST /invoices", () => {
    test("Create a new invoice", async () => {
        const newInvoice = {
            comp_code : 'apple',
            amt : 300,
            paid : false,
            paid_date : null
        }
        const res = await request(app).post("/invoices").send(newInvoice);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({msg : "sucessfully created new invoice"});
    })
})

describe("PUT /invoices/:id", () => {
    test("Updates the matching invoice", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({amt : 500});

        // JSON would only return the date as a string, so had to convert it back to a date.
        res.body.invoices.add_date = new Date(res.body.invoices.add_date);

        testInvoice.amt = 500;

        expect(res.status).toBe(200);
        expect(res.body).toEqual({invoices : testInvoice});
    })
})

describe("DELETE /invoices/:id", () => {
    test("Deletes the matching invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message : `Successfully deleted`});
    })
})

describe("GET /invoices/companies/:code", () => {
    test("Get specific company and matching invoices", async () => {
        const res = await request(app).get(`/invoices/companies/${testInvoice.comp_code}`);

        // JSON would only return the date as a string, so had to convert it back to a date.
        res.body.invoices[0].add_date = new Date(res.body.invoices[0].add_date);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company : res.body.company, invoices : [testInvoice]});
    })
})
