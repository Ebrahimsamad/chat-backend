require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
const CustomError = require("./utils/customError");

const userRoutes = require("./routes/user");

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use(userRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `This route : ${req.url} not found` });
});
app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
});

mongoose
  .connect(process.env.DB_URL)
  .then(async () => {
    try {
      app.listen(process.env.PORT || PORT, () => {
        console.log(
          `started with URL: http://localhost:${process.env.PORT || PORT}/`
        );
      });
    } catch (error) {
      console.error("Error during database initialization:", error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

module.exports = app;
