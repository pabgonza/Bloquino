// Generado desde bloques (avanzado: varios programas a la vez)
// Cada programa es una función que avanza hasta su próxima espera y devuelve
// el control; "paso" recuerda por dónde iba. Así ninguno frena a los demás.
#define EMPEZAR() static int paso = 0; static unsigned long despierta = 0; switch (paso) { case 0:
#define TERMINAR() } paso = -1
#define CEDER() do { paso = __LINE__; return; case __LINE__:; } while (0)
#define ESPERAR(ms) do { despierta = millis() + (unsigned long)(ms); paso = __LINE__; return; case __LINE__: if ((long)(millis() - despierta) < 0) return; } while (0)
#define ESPERAR_HASTA(condicion) do { paso = __LINE__; case __LINE__: if (!(condicion)) return; } while (0)

float encendido = 0;

void programa1() {
  EMPEZAR();
  while (true) {
    digitalWrite(13, HIGH);
    ESPERAR(500);
    digitalWrite(13, LOW);
    ESPERAR(500);
    CEDER();
  }
  TERMINAR();
}

void programa2() {
  EMPEZAR();
  while (true) {
    ESPERAR_HASTA(digitalRead(2) == LOW);
    ESPERAR(20);
    encendido = 1 - encendido;
    if (encendido == 1) {
      digitalWrite(12, HIGH);
    } else {
      digitalWrite(12, LOW);
    }
    ESPERAR_HASTA(digitalRead(2) == HIGH);
    ESPERAR(20);
  }
  TERMINAR();
}

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(12, OUTPUT);
}

void loop() {
  programa1();
  programa2();
}
