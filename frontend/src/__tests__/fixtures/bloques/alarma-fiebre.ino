// Generado desde bloques
#include <DHT.h>

DHT dht2(2, DHT11);

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
  dht2.begin();
}

void loop() {
  Serial.println(dht2.readTemperature());
  if (dht2.readTemperature() > 30) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  delay(1000);
}
