import serial
import time
import requests

# Tinkercad/Local Arduino Serial Config
SERIAL_PORT = '/dev/cu.usbserial-0001' # Change to COM3 etc on Windows
BAUD_RATE = 9600

# ThingSpeak Config
WRITE_API_KEY = "YOUR_THINGSPEAK_WRITE_API_KEY"
BASE_URL = "https://api.thingspeak.com/update"

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Connected to {SERIAL_PORT}")
    time.sleep(2) # Give Arduino time to reset
except Exception as e:
    print(f"Failed to connect to Serial: {e}")
    print("Running in DEMO mode (simulated data) if serial fails.")
    ser = None

def parse_and_send(line):
    # Expecting format from Arduino: "MOISTURE:45 PUMP:1"
    try:
        parts = line.strip().split()
        moisture = parts[0].split(':')[1]
        pump_state = parts[1].split(':')[1]
        
        print(f"Sending -> Moisture: {moisture}%, Pump: {'ON' if pump_state=='1' else 'OFF'}")
        
        # In ThingSpeak: Field 1 = Moisture, Field 2 = Pump Status
        payload = {
            "api_key": WRITE_API_KEY,
            "field1": moisture,
            "field2": pump_state,
        }
        
        response = requests.get(BASE_URL, params=payload)
        if response.status_code == 200:
            print("Successfully updated ThingSpeak")
        else:
            print("Failed to update ThingSpeak")
            
    except Exception as e:
         print(f"Error parsing or sending: {e}")

while True:
    try:
        if ser and ser.in_waiting > 0:
            line = ser.readline().decode('utf-8').strip()
            if line:
                parse_and_send(line)
        time.sleep(15) # ThingSpeak free tier requires 15s delay between requests
    except KeyboardInterrupt:
        print("Stopping...")
        if ser:
            ser.close()
        break
