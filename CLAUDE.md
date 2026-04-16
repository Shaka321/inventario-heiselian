# INVENTARIO HEISELIAN — Guía de Arquitectura para Claude Code

## PROJECT OVERVIEW
- **Sistema:** Control de inventario y antifraude
- **Stack:** NestJS 10 + TypeScript 5 + PostgreSQL 15 + Redis 7 + Next.js 14
- **Arquitectura:** Clean Architecture estricta
- **Versión doc:** 3.0
- **Repositorio:** https://github.com/Shaka321/inventario-heiselian

## ARCHITECTURE RULES (NUNCA violar estas reglas)
1. Ningún controlador contiene lógica de negocio. Solo llama a un Application Service.
2. Ningún repositorio contiene lógica de negocio. Solo accede a datos.
3. Ninguna entidad de dominio importa nada de infraestructura (Prisma, Express, NestJS).
4. Toda salida de inventario tiene una venta asociada. Sin excepción, sin bypass.
5. Todo evento que cambia estado genera un registro en audit_log con checksum HMAC-SHA256.
6. El precio se snapshottea al momento de iniciar la venta, no al confirmarla.
7. No se elimina ningún registro de negocio. Solo soft-delete (campo activo = false).
8. Toda falla de dominio lanza un DomainError tipado, nunca un string genérico.

## DOMAIN ERRORS
```typescript
export class DomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class StockInsuficienteError extends DomainError {}
export class VarianteInactivaError extends DomainError {}
export class PrecioInvalidoError extends DomainError {}
export class AccesoNoAutorizadoError extends DomainError {}
export class DevolucionFueraDePlazoError extends DomainError {}
export class JustificacionInvalidaError extends DomainError {}
// Mapeo en Presentation: DomainError → HTTP 422 | AccesoNoAutorizadoError → HTTP 403
```

## AUDIT INTEGRITY
- Todo AuditLog incluye campo `checksum = HMAC-SHA256(payload, AUDIT_HMAC_SECRET)`
- El payload se serializa con claves ordenadas: JSON.stringify con sort
- Nunca crear un AuditLog sin checksum
- El checksum se genera en infrastructure/audit/audit.service.ts

## CACHE STRATEGY
- NUNCA usar invalidación directa: `redis.del('clave')`
- SIEMPRE usar cache versioning: `await redis.incr('version:entidad')`
- Clave de caché incluye versión: `reporte:ventas:${fecha}:v${version}`
- TTL reportes: 5 min | TTL catálogo: 60 min | TTL stock crítico: 2 min

## DATABASE INDEXES (incluir en toda migración relevante)
- variante: [productoId], [sku], [stockActual], [sucursalId, activo]
- venta: [sucursalId, createdAt], [empleadoId], [estado]
- audit_log: [entidad, entidadId], [userId, createdAt], [tipoEvento, createdAt]
- refresh_token: [userId], [tokenHash]
- precio_historial: [varianteId, createdAt]

## FOLDER STRUCTURE