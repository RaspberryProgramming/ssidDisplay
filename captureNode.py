#!/usr/bin/python3
"""
[summary]
"""
# Imports
import requests
import asyncio
from scapy.all import sniff, Dot11Beacon, Dot11Elt

# Settings
defaultAddress = "http://127.0.0.1:3000/post"  # Address to send found ssids
# Specifies wireless interface to capture 802.11 packets. Make sure it's in monitor mode
interface = "wlp2s0mon"


async def main():
    while True:
        packet = sniff(count=1, filter="type mgt subtype beacon",
                       iface=interface)  # Capture packets
        ssidProcessor(packet)


async def ssidProcessor(packet):
    try:
        # extract ssid
        ssid = packet[0][Dot11Beacon][Dot11Elt].info.decode()
        print(ssid)
        # await  sendSSID(ssid)
    except:
        print(packet[0])


async def sendSSID(ssid, addr=defaultAddress):
    content = {"ssid": ssid}  # Stores json data to be sent to server

    requests.post(addr, json=content)  # Send post request


asyncio.run(main())
