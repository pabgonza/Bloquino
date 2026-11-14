// Generado desde bloques
void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
  tone(8, 440);
  delay(300);
  noTone(8);
  tone(8, 659);
  delay(300);
  noTone(8);
}
