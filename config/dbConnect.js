const mongoose = require("mongoose");

const connectDb = async () =>  { 
    try {
        const connect = await mongoose.connect(process.env.CONNETION_STRING);
        console.log("Database connected ", connect.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;