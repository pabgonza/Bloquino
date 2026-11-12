// Generado desde bloques (avanzado: varios programas a la vez)
#include <BuzzerMusic.h>

// Cada programa es una función que avanza hasta su próxima espera y devuelve
// el control; "paso" recuerda por dónde iba. Así ninguno frena a los demás.
#define EMPEZAR() static int paso = 0; static unsigned long despierta = 0; switch (paso) { case 0:
#define TERMINAR() } paso = -1
#define CEDER() do { paso = __LINE__; return; case __LINE__:; } while (0)
#define ESPERAR(ms) do { despierta = millis() + (unsigned long)(ms); paso = __LINE__; return; case __LINE__: if ((long)(millis() - despierta) < 0) return; } while (0)
#define ESPERAR_HASTA(condicion) do { paso = __LINE__; case __LINE__: if (!(condicion)) return; } while (0)

BuzzerMusic musica8(8);

void programa1() {
  EMPEZAR();
  musica8.start(BuzzerMusic::MARIO_BROS);
  while (true) {
    digitalWrite(13, HIGH);
    ESPERAR(200);
    digitalWrite(13, LOW);
    ESPERAR(200);
    CEDER();
  }
  TERMINAR();
}

void programa2() {
  EMPEZAR();
  while (true) {
    ESPERAR_HASTA(digitalRead(2) == LOW);
    ESPERAR(20);
    musica8.stop();
    ESPERAR_HASTA(digitalRead(2) == HIGH);
    ESPERAR(20);
  }
  TERMINAR();
}

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  musica8.update();
  programa1();
  programa2();
}
