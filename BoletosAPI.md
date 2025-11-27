# Flujo de Compra de Boletos API

Este documento describe el flujo de endpoints de la API para buscar un evento, seleccionar un viaje y comprar un boleto.

## 1. Búsqueda de Eventos

Para iniciar, el usuario necesita encontrar un evento.

### GET /api/Eventos

Obtiene una lista de todos los eventos. Se puede filtrar por fecha, ciudad, etc.

**Query Parameters:**

*   `fechaDesde` (DateTime?): Filtra eventos desde esta fecha.
*   `fechaHasta` (DateTime?): Filtra eventos hasta esta fecha.
*   `ciudad` (string?): Filtra por ciudad.
*   `estatus` (int?): Filtra por ID de estatus.
*   `soloActivos` (bool): Si es `true`, solo devuelve eventos activos y futuros.

**Respuesta Exitosa (200 OK):**

Un array de `EventoResponseDto`.

```json
[
  {
    "eventoID": 1,
    "nombre": "Concierto de Rock",
    "descripcion": "El mejor concierto del año.",
    "tipoEvento": "Concierto",
    "fecha": "2025-12-01T00:00:00",
    "horaInicio": "20:00:00",
    "recinto": "Estadio Nacional",
    "direccion": "Av. Principal 123",
    "ciudad": "Ciudad de Mexico",
    "estado": "CDMX",
    "ubicacionLat": 19.432608,
    "ubicacionLong": -99.133209,
    "urlImagen": "https://example.com/imagen.jpg",
    "estatus": 1,
    "estatusNombre": "Activo",
    "fechaCreacion": "2025-11-20T10:00:00",
    "creadoPor": "user-id",
    "totalViajes": 2
  }
]
```

---

### GET /api/Eventos/{id}

Obtiene los detalles de un evento específico por su ID.

**Path Parameters:**

*   `id` (int): El ID del evento.

**Respuesta Exitosa (200 OK):**

Un objeto `EventoResponseDto`.

```json
{
  "eventoID": 1,
  "nombre": "Concierto de Rock",
  "descripcion": "El mejor concierto del año.",
  // ... resto de los campos como en la lista
}
```

---

## 2. Búsqueda de Viajes para un Evento

Una vez que el usuario ha seleccionado un evento, necesita ver los viajes disponibles.

### GET /api/Eventos/{id}/viajes

Obtiene todos los viajes asociados a un evento específico.

**Path Parameters:**

*   `id` (int): El ID del evento.

**Respuesta Exitosa (200 OK):**

Un array de objetos que representan los viajes.

```json
[
  {
    "viajeID": 101,
    "codigoViaje": "V20251120123456",
    "tipoViaje": "Ida",
    "fechaSalida": "2025-12-01T14:00:00",
    "fechaLlegadaEstimada": "2025-12-01T18:00:00",
    "rutaNombre": "Centro - Estadio",
    "ciudadOrigen": "Centro",
    "ciudadDestino": "Estadio Nacional",
    "unidadPlacas": "XYZ-123",
    "choferNombre": "Juan Pérez",
    "cupoTotal": 50,
    "asientosDisponibles": 30,
    "asientosVendidos": 20,
    "precioBase": 250.00,
    "ventasAbiertas": true,
    "estatus": 1,
    "estatusNombre": "Programado"
  }
]
```

---

### GET /api/Viajes/{id}/detalle-cliente

Obtiene un detalle completo de un viaje, incluyendo las paradas y los precios de cada una.

**Path Parameters:**

*   `id` (int): El ID del viaje.

**Respuesta Exitosa (200 OK):**

Un objeto `ViajeDetalleClienteDto`.

```json
{
  "viajeID": 101,
  "codigoViaje": "V20251120123456",
  "eventoNombre": "Concierto de Rock",
  // ... otros detalles del evento y viaje
  "precioDesde": 280.00,
  "precioHasta": 350.00,
  "paradas": [
    {
      "paradaViajeID": 201,
      "nombreParada": "Parada Centro",
      "direccion": "Calle Falsa 123",
      "horaEstimadaLlegada": "2025-12-01T14:00:00",
      "precioBase": 250.00,
      "cargoServicio": 30.00,
      "iva": 44.80,
      "totalAPagar": 324.80,
      "asientosDisponibles": 30
    },
    {
      "paradaViajeID": 202,
      "nombreParada": "Parada Norte",
      // ... otros detalles de la parada
    }
  ],
  "tieneServicioWifi": true,
  "tieneAireAcondicionado": true,
  "tieneBaño": false
}
```

---

## 3. Proceso de Compra

Con un viaje y parada seleccionados, el usuario puede comenzar la compra.

### GET /api/boletos/calcular-precio

Calcula el precio final de un boleto, aplicando posibles descuentos de cupón y precios por parada.

**Query Parameters:**

*   `viajeId` (int, **requerido**): ID del viaje.
*   `paradaAbordajeId` (int?): ID de la parada donde el pasajero subirá.
*   `cuponId` (int?): ID de un cupón de descuento.

**Respuesta Exitosa (200 OK):**

Un objeto `CalculoPrecioDto`.

```json
{
  "viajeID": 101,
  "codigoViaje": "V20251120123456",
  "precioBase": 250.00,
  "cargoServicio": 30.00,
  "descuento": 25.00,
  "subtotal": 255.00,
  "iva": 40.80,
  "precioTotal": 295.80,
  "cuponAplicado": "DESCUENTO10",
  "asientosDisponibles": 30
}
```

---

### POST /api/boletos/iniciar-compra

Inicia la reserva de los boletos. Esto crea los boletos con estatus "Pendiente" y genera un código de pago. Los asientos se reservan temporalmente.

**Request Body (`IniciarCompraDto`):**

```json
{
  "viajeID": 101,
  "pasajeros": [
    {
      "nombrePasajero": "Juanito Viajero",
      "emailPasajero": "juanito@example.com",
      "telefonoPasajero": "5512345678"
    }
  ],
  "paradaAbordajeID": 201,
  "cuponID": 5
}
```

**Respuesta Exitosa (200 OK):**

```json
{
  "success": true,
  "message": "Reserva iniciada correctamente",
  "codigoPago": "PAG-20251120-ABC12345",
  "montoTotal": 295.80,
  "cantidadBoletos": 1,
  "boletos": [ "BOL-20251120-XYZ98765" ]
}
```
A continuación, el sistema debe redirigir al usuario a una pasarela de pagos externa.

---

## 4. Confirmación de Pago

La pasarela de pago (ej. Stripe, MercadoPago) deberá llamar a este endpoint para confirmar el resultado de la transacción.

### POST /api/pagos/confirmacion

Este es un endpoint de tipo **webhook**. Al recibir la confirmación, actualiza el estado de los boletos a "Pagado" y el del viaje (asientos vendidos).

**Request Body (`ConfirmacionPagoDto`):**

```json
{
  "transaccionID": "txn_123456789",
  "codigoPago": "PAG-20251120-ABC12345",
  "estado": "approved",
  "proveedor": "Stripe",
  "montoConfirmado": 295.80
}
```

**Respuesta Exitosa (200 OK):**

```json
{
  "success": true,
  "message": "Pago confirmado exitosamente",
  "codigoPago": "PAG-20251120-ABC12345",
  "transaccionId": "txn_123456789"
}
```
Si el pago es exitoso, el sistema enviará los boletos por correo electrónico.

---

## 5. Visualización de Boletos Comprados

El usuario puede consultar sus boletos en cualquier momento.

### GET /api/boletos/me/boletos

Obtiene todos los boletos comprados por el usuario autenticado.

**Respuesta Exitosa (200 OK):**

Un array de `BoletoResponseDto`.

```json
{
  "success": true,
  "data": [
    {
      "boletoID": 501,
      "codigoBoleto": "BOL-20251120-XYZ98765",
      "codigoQR": "BASE64_QR_CODE",
      "viajeID": 101,
      "codigoViaje": "V20251120123456",
      "ciudadOrigen": "Centro",
      "ciudadDestino": "Estadio Nacional",
      "fechaSalida": "2025-12-01T14:00:00",
      "numeroAsiento": "12",
      "nombrePasajero": "Juanito Viajero",
      "emailPasajero": "juanito@example.com",
      "precioTotal": 295.80,
      "estatusNombre": "Pagado",
      "fechaCompra": "2025-11-20T12:00:00",
      "paradaAbordaje": "Parada Centro"
    }
  ],
  "total": 1
}
```