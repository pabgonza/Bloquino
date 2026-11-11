# Spec Delta

## Purpose

El trabajo del alumno no se pierde al recargar o cerrar la página: el proyecto se guarda solo en su navegador, sin cuentas ni servidor, y vuelve a aparecer al abrir el editor.

## ADDED Requirements

### Requirement: Guardado automático en el navegador
En modo alumno, el editor SHALL guardar el proyecto completo (placa, componentes, cables, bloques, código y modo Texto) en el navegador, sin acción del usuario, a más tardar 2 segundos después del último cambio. Si la página se cierra o se recarga con cambios pendientes, SHALL guardarlos antes de salir. El navegador SHALL conservar un solo proyecto: el que está en curso.

#### Scenario: Recargar la página
- **WHEN** el alumno agrega un LED, lo cablea, cambia un bloque, espera 2 segundos y recarga la página
- **THEN** ve el mismo circuito, los mismos cables y los mismos bloques

#### Scenario: Cerrar justo después de un cambio
- **WHEN** el alumno mueve un componente y cierra la pestaña de inmediato
- **THEN** al volver a abrir el editor el componente está donde lo dejó

#### Scenario: Modo Texto
- **WHEN** el alumno pasa a modo Texto, edita el código y recarga la página
- **THEN** el editor abre en modo Texto con el código que escribió

### Requirement: Restauración al abrir
Al abrir el editor en modo alumno, SHALL cargarse el proyecto guardado en ese navegador, con la simulación detenida. Sin proyecto guardado, SHALL abrirse el proyecto inicial.

#### Scenario: Sin proyecto guardado
- **WHEN** el alumno abre el editor por primera vez en un navegador
- **THEN** ve el proyecto inicial: un Arduino UNO y el programa de parpadeo

#### Scenario: La simulación no se restaura
- **WHEN** el alumno recarga la página con la simulación corriendo
- **THEN** el proyecto vuelve con la simulación detenida

### Requirement: Indicador de guardado
La página de alumno SHALL mostrar un indicador discreto con el estado del guardado: "Guardando…" mientras hay cambios sin guardar y "Guardado" cuando el proyecto guardado está al día.

#### Scenario: Ciclo de un cambio
- **WHEN** el alumno agrega un componente
- **THEN** el indicador dice "Guardando…" y, a los pocos segundos, "Guardado"

### Requirement: Navegador sin almacenamiento
Si el navegador no permite guardar (modo privado, datos bloqueados o espacio lleno), el editor SHALL seguir funcionando y el indicador SHALL avisar que el proyecto no se está guardando y que conviene descargarlo.

#### Scenario: Almacenamiento bloqueado
- **WHEN** el navegador rechaza la escritura y el alumno cambia su proyecto
- **THEN** puede seguir trabajando y simular, y el indicador avisa que el proyecto no se pudo guardar

### Requirement: Proyecto guardado dañado
Un proyecto guardado que no se puede leer SHALL NOT impedir abrir el editor: SHALL abrirse el proyecto inicial.

#### Scenario: Datos corruptos
- **WHEN** lo guardado en el navegador no es un proyecto válido
- **THEN** el editor abre con el proyecto inicial y sin mensajes de error

### Requirement: El modo profe no participa
El editor en modo profe SHALL NOT guardar ni restaurar el proyecto del alumno.

#### Scenario: Profe en el mismo navegador
- **WHEN** el profesor abre `/editor?profe` en el navegador de un alumno, cambia algo y vuelve a `/editor?alumno`
- **THEN** el proyecto del alumno está como lo dejó
