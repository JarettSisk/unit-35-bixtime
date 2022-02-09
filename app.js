/** BizTime express application. */

const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


// companies routes
const companiesRoutes = require("./routes/companies");
app.use("/companies", companiesRoutes);

// invoice routes
const invoiceRoutes = require("./routes/invoices");
app.use("/invoices", invoiceRoutes);

// Industry routes
const industryRoutes = require("./routes/industries");
app.use("/industries", industryRoutes);

/** 404 handler */
app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;