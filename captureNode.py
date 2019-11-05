#!/usr/bin/python3
"""
[summary] 
"""
# Imports
import requests
from scapy.all import sniff

# Settings
defaultAddress = "http://127.0.0.1:3000/post"
interface = "wlp2s0mon"

""" The next line will be changed later on, this is not necessary for the final version
# Requests what data will be sent to server
ssid = input("What ssid would you like to send: ")
"""


def main():
    while True:
        packet = sniff(
            count=1, filter="type mgt subtype beacon", iface=interface)  # Capture packets
        print(packet)  # extract ssid
        # sendSSID(ssid)


def sendSSID(ssid, addr=defaultAddress):
    content = {"ssid": ssid}  # Stores json data to be sent to server

    requests.post(addr, json=content)  # Send post request


main()
