const { json } = require("body-parser");
const { title } = require("node:process");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.status ? res.statusCode : 500;
    switch (statusCode) {
        case 400:
            res.json({
                title: "Validation Failed", 
                message: err.message,
                stackTrace: err.stack,
            });
            break;
        case 404:
            res.json({
                title: "Page Not Found", 
                message: err.message,
                stackTrace: err.stack,
            });
            break;
        default:
            break;
    }
    res.json( {title: "Not found",
                message: err.message,
                    stackTrace: err.stack})
};  

module.exports = errorHandler;