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
    digitalWrite(6, HIGH);
    ESPERAR(100);
    digitalWrite(6, LOW);
    ESPERAR(100);
    CEDER();
  }
  TERMINAR();
}

void programa2() {
  EMPEZAR();
  while (true) {
    digitalWrite(7, HIGH);
    ESPERAR(200);
    digitalWrite(7, LOW);
    ESPERAR(200);
    CEDER();
  }
  TERMINAR();
}

void programa3() {
  EMPEZAR();
  while (true) {
    digitalWrite(8, HIGH);
    ESPERAR(300);
    digitalWrite(8, LOW);
    ESPERAR(300);
    CEDER();
  }
  TERMINAR();
}

void programa4() {
  EMPEZAR();
  while (true) {
    digitalWrite(9, HIGH);
    ESPERAR(400);
    digitalWrite(9, LOW);
    ESPERAR(400);
    CEDER();
  }
  TERMINAR();
}

void programa5() {
  EMPEZAR();
  while (true) {
    digitalWrite(10, HIGH);
    ESPERAR(500);
    digitalWrite(10, LOW);
    ESPERAR(500);
    CEDER();
  }
  TERMINAR();
}

void programa6() {
  EMPEZAR();
  while (true) {
    digitalWrite(11, HIGH);
    ESPERAR(600);
    digitalWrite(11, LOW);
    ESPERAR(600);
    CEDER();
  }
  TERMINAR();
}

void programa7() {
  EMPEZAR();
  while (true) {
    digitalWrite(12, HIGH);
    ESPERAR(700);
    digitalWrite(12, LOW);
    ESPERAR(700);
    CEDER();
  }
  TERMINAR();
}

void programa8() {
  EMPEZAR();
  while (true) {
    digitalWrite(13, HIGH);
    ESPERAR(800);
    digitalWrite(13, LOW);
    ESPERAR(800);
    CEDER();
  }
  TERMINAR();
}

void setup() {
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  programa1();
  programa2();
  programa3();
  programa4();
  programa5();
  programa6();
  programa7();
  programa8();
}
