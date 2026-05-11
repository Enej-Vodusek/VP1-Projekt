const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");

app.use(cors({
   origin: "http://localhost:8081", //allows frontend to use cookies with backend
   credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "sesVer2026",
    resave: false,
    saveUninitialized: false,
  }),
);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api", require("./routes/scrapeRoutes")); //sends to userRoutes if /user
app.use("/user", require("./routes/userRoutes")); //sends to userRoutes if /user

module.exports = app;
