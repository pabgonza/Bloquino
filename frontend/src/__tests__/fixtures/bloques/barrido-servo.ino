// Generado desde bloques
#include <Servo.h>

Servo servo9;

void setup() {
  servo9.attach(9);
}

void loop() {
  for (int i = 0; i <= 180; i++) {
    servo9.write(i);
    delay(20);
  }
  delay(1000);
  servo9.write(0);
  delay(1000);
}
