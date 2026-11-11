// Generado desde bloques (avanzado: varios programas a la vez)
// Cada programa es una función que avanza hasta su próxima espera y devuelve
// el control; "paso" recuerda por dónde iba. Así ninguno frena a los demás.
#define EMPEZAR() static int paso = 0; static unsigned long despierta = 0; switch (paso) { case 0:
#define TERMINAR() } paso = -1
#define CEDER() do { paso = __LINE__; return; case __LINE__:; } while (0)
#define ESPERAR(ms) do { despierta = millis() + (unsigned long)(ms); paso = __LINE__; return; case __LINE__: if ((long)(millis() - despierta) < 0) return; } while (0)
#define ESPERAR_HASTA(condicion) do { paso = __LINE__; case __LINE__: if (!(condicion)) return; } while (0)

void programa1() {
  EMPEZAR();
  while (true) {
    digitalWrite(13, HIGH);
    ESPERAR(1000);
    digitalWrite(13, LOW);
    ESPERAR(1000);
    CEDER();
  }
  TERMINAR();
}

void programa2() {
  EMPEZAR();
  while (true) {
    digitalWrite(12, HIGH);
    ESPERAR(300);
    digitalWrite(12, LOW);
    ESPERAR(300);
    CEDER();
  }
  TERMINAR();
}

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  programa1();
  programa2();
}
