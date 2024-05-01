const mongoose = require('mongoose');

async function ConnectDB() {
    try {
        mongoose.set('debug', true);

        // Connect to the MongoDB cluster
        await mongoose.connect(
            process.env.MONGO_DB_URL,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
    } catch (e) {
        console.log("could not connect", e);
    }
};

module.exports = ConnectDB;
