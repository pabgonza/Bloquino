// Generado desde bloques
#include <Servo.h>

Servo servo9;

void setup() {
  servo9.attach(9);
}

void loop() {
  servo9.write(map(map(analogRead(A0), 0, 1023, 0, 100), 0, 100, 0, 180));
  delay(50);
}
