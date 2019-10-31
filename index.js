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
    logs: [],
    ssids: [],
};

function log(info) {
    let logText = `[${Date.now()}]: ${info}`;
    database.logs.push(logText);
    console.log(logText);
}

//socket.io

io.on("connection", function (socket) {
    console.log("a user connected");
    socket.emit("init", {
        ssids: database.ssids
    });
    socket.on("disconnect", function () {
        console.log("user disconnected");
    });
});

//Setting up each page

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html");
});

app.get("*.css", (req, res) => {
    res.sendFile(__dirname + `/public/css${req.originalUrl}`);
    console.log(`/public/css${req.originalUrl}`);
});

app.get("/scripts/*.js", (req, res) => {
    res.sendFile(__dirname + `/public/scripts${req.originalUrl}`);
    console.log(`/public/scripts${req.originalUrl}`);
});

app.post("/post", (req, res) => {
    let ssid = req.body.ssid;
    if (database.ssids.indexOf(ssid) === -1) {
        let output = `[${Date.now()}] ${ssid}`;
        database.ssids.push(output);
        log(`${ssid} has been found!`);
        io.emit("ssid", output);
    } else {
        log("Error");
    }

    res.send({
        ssid: ssid,
    });
});

app.use(favicon(__dirname + "/public/images/favicon.jpg"));

app.use((req, res) => {
    res.status(404);
    console.log(
        `${req.body.host} connected to the server. They requested ${req.path}, but this page was unavailable.`
    );
    res.send("Error 404");
});

http.listen(port, () => console.log(`Running on port ${port}.`));