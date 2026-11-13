// Generado desde bloques
void color(float r, float g, float b) {
  analogWrite(9, r);
  analogWrite(10, g);
  analogWrite(11, b);
}

void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  color(255, 0, 0);
  delay(1000);
  color(0, 255, 0);
  delay(1000);
  color(0, 0, 255);
  delay(1000);
}
