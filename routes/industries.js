const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Get all industries
router.get('/', async (req, res, next) => {
    try {
 
        const result = await db.query(`
            SELECT i.code, i.industry, c.code AS company
            FROM industries AS i
            LEFT JOIN companies_industries AS ci
            ON i.code = ci.industry_code
            LEFT JOIN companies AS c
            ON c.code = ci.company_code
            `);


            /*
            The chunk of code below is a bit ugly, but it achieved the result I was looking for.
            There is probobly a better approach but I was trying not to linger on the issue for too long.
            */

            // The format I wanted to be returned
            // industries : [
            //     {code : 'CE', industry : 'consumer electronics', companies : ['apple', 'ibm'] } 
            // ]

            let industriesCompanies = {};
            for (let row of result.rows) {
                if(row.code in industriesCompanies) {
                    if(!industriesCompanies[row.code].includes(row.company)) {
                        industriesCompanies[row.code].push(row.company);
                        
                    }
                } else {
                    industriesCompanies[row.code] = [];
                    industriesCompanies[row.code].push(row.company);
                }
            }

            let temp = [];
            let newResult = [];
            for(let row of result.rows) {
                if(!temp.includes(row.code)) {
                    temp.push(row.code);
                    newResult.push({code: row.code, industry: row.industry});
                }
            }

            for(let i of newResult){
                if(i.code in industriesCompanies) {
                    i['companies'] = industriesCompanies[i.code];
                }
            }


        return res.json( {industries : newResult} );
    } catch (error) {
        return next(error);
    }
})

// Create a new industry
router.post("/", async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const result = await db.query("INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry", [code, industry]);
        return res.status(201).json( {industry : result.rows[0]} );
    } catch (error) {
        return next(error);
    }
})

// Create new company / industry relationship
router.post("/add-company", async (req, res, next) => {
    try {
        const { company_code, industry_code } = req.body;
        const result = await db.query("INSERT INTO companies_industries (company_code, industry_code) VALUES ($1, $2)", [company_code, industry_code]);
        return res.status(201).json( {msg : "Success"} );
    } catch (error) {
        
    }
})



module.exports = router;