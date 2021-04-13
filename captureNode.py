#!/usr/bin/python3
"""
[summary]
"""
# Imports
import requests
#import asyncio
from scapy.all import sniff, Dot11Beacon, Dot11Elt

# Settings
defaultAddress = "http://127.0.0.1:3000/post"  # Address to send found ssids
# Specifies wireless interface to capture 802.11 packets. Make sure it's in monitor mode
interface = "wlp2s0mon"


def main():
    # Loop packet sniffing
    while True:
        packet = sniff(count=1, filter="type mgt subtype beacon",
                       iface=interface)  # Capture packets and filter beacons
        ssidProcessor(packet) # pass packet to ssidProcessor


def ssidProcessor(packet):
    # Process the packet
    try:
        # extract ssid
        ssid = packet[0][Dot11Beacon][Dot11Elt].info.decode()
        print(ssid)
        # Send SSID to appropriate server
        sendSSID(ssid)
    except:
        print(packet[0])


def sendSSID(ssid, addr=defaultAddress):
    # set dictionary with "ssid": ssid
    content = {"ssid": ssid}  # Stores json data to be sent to server

    # Send POST to server with the ssid
    requests.post(addr, json=content)  # Send post request

if __name__ in '__main__':
    main()
