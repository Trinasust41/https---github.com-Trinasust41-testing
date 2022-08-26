const express = require("express");
const app = express();
const { userRoute } = require("./routes/users.routes");
const accountsRoute = require("./routes/accounts.routes");

//for post:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// }

app.use("/api", userRoute);
app.use("/api", accountsRoute);

const listenServer = (e) => console.log(e ? "Something went wrong" : "server is listening on port " + PORT);
app.listen(PORT, listenServer);
