const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Get all invoices
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT id, comp_code FROM invoices");
        return res.json( {invoices : result.rows} );
    } catch (error) {
        return next(error);
    }
})

// Get invoice that matches given id
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
        if (result.rows.length === 0) {
            throw new ExpressError("No invoice found, Please check id", 404);
        }
        return res.json( {invoices : result.rows[0]});
    } catch (error) {
        return next(error);
    }
})

// Create a new invoice
router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt, paid, paid_date } = req.body;
        const result = await db.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING *", [comp_code, amt, paid, paid_date]);
        return res.status(201).json( {invoices : result.rows[0]} );
    } catch (error) {
        return next(error);
    }
})

// Edit the invoice that matched the given id
router.put("/:id", async(req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const result = await db.query("UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *", [amt, id]);
        if (result.rows.length === 0) {
            throw new ExpressError("No invoice found, please check id", 404);
        }
        return res.json( {invoices : result.rows[0]} );
    } catch (error) {
        return next(error);
    }
})

// Delete the invoice that matches the given id
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query("DELETE FROM invoices WHERE id=$1", [id]);
        if (result.rowCount !== 1) {
            throw new ExpressError("No invoice found, please check id", 404);
        }
        return res.json( {message : "Successfully deleted"});
    } catch (error) {
        return next(error);
    }
})

// Get specific company and matching invoices
router.get("/companies/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyResult = await db.query("SELECT * FROM companies WHERE code=$1", [code]);
        const invoiceResult = await db.query("SELECT * FROM invoices WHERE comp_code=$1", [code]);
        if (companyResult.rows.length === 0) {
            throw new ExpressError("No company found. Please check company code", 404);
        }
        return res.json( {company : companyResult.rows[0], invoices : invoiceResult.rows});
    } catch (error) {
        return next(error);
    }
})

module.exports = router;