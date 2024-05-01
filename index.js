const express = require('express');
require("dotenv").config();
const cors = require("cors");
const ConnectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api", userRoutes);

const port = process.env.PORT || 8000;

app.listen(port, async () => {
  await ConnectDB();
  console.log(`App is running on port:${port}`);
});
