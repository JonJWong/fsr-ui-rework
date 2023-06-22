# Teejusb's FSR w/ updated UI
A complete software package for FSR dance pads.  
Join the ![Discord](https://img.shields.io/discord/778312862425939998?color=5865F2&label=Discord&logo=discord&logoColor=white) for any questions/suggestions

## Requirements
- A [Teensy](https://www.pjrc.com/store/index.html) or Arduino
  - uses [Joystick](https://github.com/MHeironimus/ArduinoJoystickLibrary) for Arduino and Joystick library for Teensy
  - install joystick library in `Documents/Arduino/libraries/` on windows
- Python 3.7 - 3.10 (3.11 does not work)
    - virtualenv
- Node 12-16 (Node 18 does not work)
  - yarn

## Hardware setup
Follow a guide like [fsr-pad-guide](https://github.com/Sereni/fsr-pad-guide) or [fsr](https://github.com/vlnguyen/itg-fsr/tree/master/fsr) to setup your Arduino/Teensy with FSRs.

## UI setup
1. Install [Python](https://www.python.org/downloads/). On Linux you can install Python with your distribution's package manager. On some systems you might have to additionally install the python3 header files (usually called `python3-dev` or similar).
1. Install [Node](https://nodejs.org/en/download/)
    - Install [yarn](https://classic.yarnpkg.com/en/docs/install#windows-stable). A quick way to do this is with NPM: `npm install -g yarn`
1. Within [server.py](./webui/server/server.py), edit the `SERIAL_PORT` constant to match the serial port shown in the Arduino IDE (e.g. it might look like `"/dev/ttyACM0"` or `"COM1"`)
    - You also may need to [modify](https://github.com/teejusb/fsr/pull/1#discussion_r514585060) the `sensor_numbers` variable.
1. Open a command prompt (or terminal) and navigate to `./webui/server` with `cd webui/server`
1. Run `python -m venv venv` (you may need to replace `python` with `py` on Windows or potentially `python3` on Linux)
1. Run `venv\Scripts\activate` (on Linux you run `source venv/bin/activate`)
1. Run `pip install -r requirements.txt` to install dependencies (might need to use `pip3` instead of `pip` on Linux)
1. Then move to the `./webui` directory by doing `cd ..`
1. Run `yarn install && yarn build && yarn start-api`
    - On Linux, you'll also need to edit the `start-api` script in `./webui/package.json` to reference `venv/bin/python` instead of `venv/Scripts/python`

The UI should be up and running on http://localhost:5000 and you can use your device IP and the port to reach it from your phone (e.g. http://192.168.0.xxx:5000 )


## Troubleshooting 
- If you use localhost in your browser and if the UI looks choppy, try using your local IP instead
- If you see the following error, ensure the "Serial Monitor" isn't already open in Arduino IDE `serial.serialutil.SerialException: [Errno 16] could not open port /dev/cu.usbmodem83828101: [Errno 16] Resource busy: '/dev/cu.usbmodem83828101`
- If you notice that your input is delayed and perhaps that delay increases over time, you can sometimes rectify that by restarting the server. Close your `start-api` window and run it again.
