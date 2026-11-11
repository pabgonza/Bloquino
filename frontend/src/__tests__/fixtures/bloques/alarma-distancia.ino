// Generado desde bloques
float distanciaCm(int disparo, int eco) {
  digitalWrite(disparo, LOW);
  delayMicroseconds(2);
  digitalWrite(disparo, HIGH);
  delayMicroseconds(10);
  digitalWrite(disparo, LOW);
  unsigned long eco_us = pulseIn(eco, HIGH, 25000);
  if (eco_us == 0) {
    return 400;
  }
  return eco_us / 58.0;
}

void setup() {
  pinMode(7, OUTPUT);
  pinMode(6, INPUT);
  pinMode(13, OUTPUT);
  pinMode(8, OUTPUT);
}

void loop() {
  if (distanciaCm(7, 6) < 20) {
    digitalWrite(13, HIGH);
    tone(8, 440, 200);
    delay(200);
  } else {
    digitalWrite(13, LOW);
  }
  delay(100);
}
