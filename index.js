const app = require("express")();
var http = require("http").createServer(app);
const favicon = require("express-favicon");
const path = require("path");
const bodyParser = require("body-parser");
var io = require("socket.io")(http);
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

const port = 3000;

//Preprocessors

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Setup Database
class logs extends Model {}
logs.init(
  {
    time: DataTypes.TIME,
    log: DataTypes.STRING,
  },
  { sequelize, modelName: "logs" }
);

class ssids extends Model {}
ssids.init(
  {
    time: DataTypes.TIME,
    ssid: DataTypes.STRING,
  },
  { sequelize, modelName: "ssids" }
);

ssids.sync();
logs.sync();

global.database = {
  logs: [], // when log is used it stores each log here
  ssids: [], // All ssids are stored here
};

// Needed functions
async function log(info) {
  /**
   * receives a log, stores it to the database, and prints it to the display
   */
  let time = Date.now();
  let logText = `[${time}]: ${info}`;
  //database.logs.push(logText);
  const logdata = await logs.create({
    log: info,
    time: time,
  });

  io.emit("log", logText);
  console.log(logText);
}

//socket.io
io.on("connection", function(socket) {
  /**
   * Run when a new web client connects
   */
  //log("New User Connected");
  socket.on("requestLogs", async function(msg) {
    log("Sending previous logs");
    let logsArray = [];
    const logdata = await logs.findAll({});
    if (logdata) {
      for (i in logdata) {
        logsArray.push(`[${logdata[i].get("time")}] ${logdata[i].get("log")}`);
      }
    }
    socket.emit("init", {
      // Sends an init with previous ssids to the new client
      logs: logsArray,
    });
  });
  socket.on("requestSSIDs", async function(msg) {
    //log("Sending ssid lists");
    let ssidsArray = [];
    const ssiddata = await ssids.findAll({});
    if (ssiddata) {
      for (i in ssiddata) {
        ssidsArray.push(
          `[${ssiddata[i].get("time")}] ${ssiddata[i].get("ssid")}`
        );
      }
    }
    console.log(ssids);
    socket.emit("init", {
      // Sends an init with previous ssids to the new client
      ssids: ssidsArray,
    });
  });
});

//Setting up each page

app.get("/", (req, res) => {
  /**
   * When a user connects, they are send the index.html file
   */
  res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/logs", async (req, res) => {
  res.sendFile(__dirname + "/public/html/logs.html");
});
app.get("*.css", (req, res) => {
  /**
   * When a css file is requested, /public/css is searched
   */
  res.sendFile(__dirname + `/public/css/${req.path.split("/")[1]}`);
  console.log(`/public/css/${req.path.split("/")[1]}`);
});

app.get("/scripts/*.js", (req, res) => {
  /**
   * when a js file is requested, /public/scripts is searched
   */
  res.sendFile(__dirname + `/public/scripts/${req.path.split("/")[2]}`);
  console.log(`/public/scripts/${req.path.split("/")[2]}`);
});

app.post("/post", async (req, res) => {
  /**
   * Used when a node finds a new ssid. The post request will contain an ssid in the format like the following:
   * {ssid: "SSID"}
   * The ssid is stored in the local database, then it is sent to all web clients.
   */
  let ssid = req.body.ssid; // Extract ssid

  if (await ssids.count({ where: { ssid: ssid } }) === 0) {
    // Check if the ssid exists already

    //database.ssids.push(output); // Push the ssid to the database
    let time = Date.now();

    const ssiddata = await ssids.create({
      ssid: ssid,
      time: time,
    });

    log(`${ssid} has been found!`); // Log that the ssid is found

    io.emit("ssid", `[${time}] ${ssid}`); // send new ssid+time to all clients
  } else {
    log("SSID %s already exists." % ssid); // If the ssid exists
  }

  res.send({
    ssid: ssid,
  });
});

app.use(favicon(__dirname + "/public/images/favicon.jpg")); // Send favicon when requested

app.use((req, res) => {
  /**
   * Used when requested webpage is not found.
   */
  res.status(404); // set page to 404
  log(
    // Log that a user requested invalid page
    `${req.body.host} connected to the server. They requested ${req.path}, but this page was unavailable.`
  );
  res.send("Error 404"); // Send Error 404 to user
});

http.listen(port, () => console.log(`Running on port ${port}.`));
