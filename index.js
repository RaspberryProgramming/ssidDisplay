const app = require("express")();
var http = require("http").createServer(app);
const favicon = require("express-favicon");
const path = require("path");
const bodyParser = require("body-parser");
var io = require("socket.io")(http);

const port = 3000;

//Preprocessors

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

//Creating Functions and Variables

global.database = {
  logs: [], // when log is used it stores each log here
  ssids: [], // All ssids are stored here
};

function log(info) {
  /**
   * receives a log, stores it to the database, and prints it to the display
   */
  let logText = `[${Date.now()}]: ${info}`;
  database.logs.push(logText);
  console.log(logText);
}

//socket.io

io.on("connection", function(socket) {
  /**
   * Run when a new web client connects
   */
  console.log("a user connected"); // Logs that a user has connected
  socket.emit("init", {
    // Sends an init with previous ssids to the new client
    ssids: database.ssids,
  });
});

//Setting up each page

app.get("/", (req, res) => {
  /**
   * When a user connects, they are send the index.html file
   */
  res.sendFile(__dirname + "/public/html/index.html");
});

app.get("*.css", (req, res) => {
  /**
   * When a css file is requested, /public/css is searched
   */
  res.sendFile(__dirname + `/public/css/${req.path.split("/")[2]}`);
  console.log(`/public/css/${req.path.split("/")[2]}`);
});

app.get("/scripts/*.js", (req, res) => {
  /**
   * when a js file is requested, /public/scripts is searched
   */
  res.sendFile(__dirname + `/public/scripts/${req.path.split("/")[2]}`);
  console.log(`/public/scripts/${req.path.split("/")[2]}`);
});

app.post("/post", (req, res) => {
  /**
   * Used when a node finds a new ssid. The post request will contain an ssid in the format like the following:
   * {ssid: "SSID"}
   * The ssid is stored in the local database, then it is sent to all web clients.
   */
  let ssid = req.body.ssid; // Extract ssid

  if (database.ssids.indexOf(ssid) === -1) {
    // Check if the ssid exists already

    let output = `[${Date.now()}] ${ssid}`; // Setup output format

    database.ssids.push(output); // Push the ssid to the database

    log(`${ssid} has been found!`); // Log that the ssid is found

    io.emit("ssid", output); // send new ssid+time to all clients
  } else {
    log("SSID %s exists." % ssid); // If the ssid exists
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
