// Generado desde bloques
void setup() {
  pinMode(12, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  digitalWrite(12, HIGH);
  delay(3000);
  digitalWrite(12, LOW);
  digitalWrite(10, HIGH);
  delay(3000);
  digitalWrite(10, LOW);
  digitalWrite(11, HIGH);
  delay(1000);
  digitalWrite(11, LOW);
}
