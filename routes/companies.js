const express = require("express");
const slugify = require("slugify");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Get all companies
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT code, name, description FROM companies");
        return res.json( {companies : result.rows} );
    } catch (error) {
        return next(error);
    }
})

// Get company by company code
router.get('/:code', async (req, res, next) => {
    try {

        
        const result = await db.query(
           `SELECT c.code, c.name, c.description, i.industry 
            FROM companies AS C 
            LEFT JOIN companies_industries AS ci
            ON c.code = ci.company_code 
            LEFT JOIN industries AS i 
            ON ci.industry_code = i.code 
            WHERE c.code = $1`, [req.params.code]);

        if (result.rows.length === 0) {
            throw new ExpressError("That company code does not exist", 404);
        }

        const industries = result.rows.map(r => r.industry);
        const { code, name, description } = result.rows[0];
        const company = {code, name, description, industries};

        return res.json( {companies : company} );
    } catch (error) {
        return next(error);
    }
})

// Create a new company
router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const result = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [slugify(name, {lower : true, strict : true}), name, description]);
        return res.status(201).json( {companies : result.rows[0]} );
    } catch (error) {
        return next(error);
    }
})

// Edit the company with the matching code
router.put("/:code", async(req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const result = await db.query("UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description", [name, description, code]);
        if (result.rows.length === 0) {
            throw new ExpressError("That company code does not exist", 404);
        }
        return res.json( {companies : result.rows[0]} );
    } catch (error) {
        return next(error);
    }
})

// Delete a company that matches the given code
router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await db.query('DELETE FROM companies WHERE code = $1', [code]);
        if (result.rowCount !== 1) {
            throw new ExpressError("That company code does not exist", 404);
        }
        return res.json( {message : `Sucessfully deleted}`});
    } catch (error) {
        return next(error);
    }
})


module.exports = router;