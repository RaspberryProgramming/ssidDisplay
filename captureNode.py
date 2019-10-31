import requests

ssid = input("What ssid would you like to send: ")

content = {"ssid": ssid}

requests.post("http://127.0.0.1:3000/post", json=content)
