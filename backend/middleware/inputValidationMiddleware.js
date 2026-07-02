const express = require('express');
const { query, matchedData, validationResult } = require('express-validator');
const app = express();

module.exports = (req, res, next) => {
    const inputData = req.body;
    console.log(inputData);
    next();
}