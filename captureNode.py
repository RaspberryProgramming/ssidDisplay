#!/usr/bin/python3
# Imports
import requests


#The next line will be changed later on, this is not necessary for the final version
ssid = input("What ssid would you like to send: ") # Requests what data will be sent to server

content = {"ssid": ssid} # Stores json data to be sent to server

requests.post("http://127.0.0.1:3000/post", json=content) # Send post request
