# ssidDisplay

I'll make this look better later. Also I'll add an install script.

## Getting Started

### Requirements

- git
- node and npm
- python3
- scapy for python3
- requests for python3

### Install Dependencies

    npm Install

### Running the server

    npm start

or

    node index.js

### Connecting

Connect to [http://localhost:3000/](http://localhost:3000/) to get the ssid log page. Following is a few notable keybinds:

`a: Toggles autoscroll`

`h: Displays help`

Connect to [http://localhost:3000/logs/](http://localhost:3000/logs/) to get a log page that has all logs including error logs from the server. This will require a login in a later update.

### Sending ssids (This is just to show proof of concept)

if python3's alias is python in your operating system

    python captureNode.py

if python3's alias is python3

    python3 captureNode.py
