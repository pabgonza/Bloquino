# Spec Delta

## Purpose

Servir Bloquino por HTTPS en la red de la sala, para que los equipos de los alumnos puedan cargar a la placa.

## ADDED Requirements

### Requirement: HTTPS con autoridad propia
El contenedor de la sala SHALL atender por HTTPS en el puerto 443, además de HTTP en el 80, con un certificado firmado por una autoridad certificadora creada en el propio notebook. La autoridad SHALL conservarse al reconstruir o recrear el contenedor.

#### Scenario: Página por HTTPS
- **WHEN** un equipo que confía en la autoridad abre `https://` más la IP del notebook
- **THEN** la página carga sin avisos y compila

#### Scenario: Reconstruir la imagen
- **WHEN** el profesor reconstruye la imagen y vuelve a levantar el contenedor
- **THEN** los equipos que ya instalaron la autoridad siguen entrando sin avisos

### Requirement: Certificado para la dirección de la sala
El certificado del servidor SHALL valer para `localhost` y para las direcciones que el profesor indique al levantar el contenedor, y SHALL rehacerse cuando esas direcciones cambien, sin cambiar la autoridad.

#### Scenario: Cambio de IP
- **WHEN** el notebook recibe otra IP y el profesor vuelve a levantar el contenedor con ella
- **THEN** la página abre sin avisos en la dirección nueva, en los equipos que ya confiaban en la autoridad

### Requirement: Entrega de la autoridad
El contenedor SHALL entregar el certificado de la autoridad en `/ca.crt`, por HTTP y por HTTPS, y nunca su clave privada.

#### Scenario: Instalar en un equipo
- **WHEN** un alumno abre `http://<IP>/ca.crt`
- **THEN** descarga el certificado de la autoridad, listo para instalarlo

### Requirement: Arranque con la dirección del día
El repositorio SHALL traer un script que detecte la IP del notebook, levante el contenedor con esa dirección en el certificado y muestre las direcciones que el profesor da a los alumnos.

#### Scenario: Antes de la clase
- **WHEN** el profesor corre el script con el notebook en la red de la sala
- **THEN** ve la dirección `https://` para los alumnos y la de descarga de la autoridad
