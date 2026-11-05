## 📌 Visión General  
**Objetivo:** Permitir a los usuarios de la plataforma **World/Aqualink** (mapa interactivo + datos de sitio) seleccionar una **fecha histórica** y visualizar el estado del mapa y los datos correspondientes a ese día.  

Esto implica:  

1. **Almacenamiento temporal de datos** (snapshots o series temporales).  
2. **API** que acepte un parámetro `date` y devuelva la información del momento solicitado.  
3. **Interfaz de usuario** con selector de fecha y lógica de “time‑travel”.  
4. **Mecanismos de mantenimiento** (retención, compresión, re‑indexado).  

A continuación se describe una solución completa, paso a paso, con arquitectura, tecnologías recomendadas, diseño de base de datos, API, UI, pruebas y plan de despliegue.

---  

## 1️⃣ Arquitectura de Alto Nivel  

```mermaid
graph LR
    A[Front‑End (React / Vue)] -->|GET /map?date=YYYY‑MM‑DD| B[API Gateway (Node/TS)]
    B --> C[Map Service (Node/TS)]
    C --> D[Time‑Series DB (TimescaleDB / InfluxDB)]
    C --> E[Snapshot Store (S3 + PostgreSQL index)]
    D --> F[Historical Data Processor (ETL)]
    E --> G[Object Store (S3/MinIO)]
    subgraph Infra
        D
        E
        G
    end
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#dfd,stroke:#333,stroke-width:2px
    style E fill:#dfd,stroke:#333,stroke-width:2px
    style G fill:#ffd,stroke:#333,stroke-width:2px
```

### Componentes Clave  

| Componente | Rol | Tecnologías sugeridas |
|------------|-----|-----------------------|
| **Front‑End** | Selector de fecha, renderizado de mapa y datos | React + TypeScript, Redux (o Zustand), Mapbox GL / Leaflet |
| **API Gateway** | Entrada única, validación, rate‑limit | Node + Express (TS) o Fastify, JWT auth |
| **Map Service** | Lógica de negocio: obtener capas, datos de sitio, aplicar filtros temporales | Node + TS, Service‑Oriented Architecture |
| **Time‑Series DB** | Almacena series de variables (temperatura, pH, etc.) con timestamp | **TimescaleDB** (extensión de PostgreSQL) o **InfluxDB 2.x** |
| **Snapshot Store** | Snapshots completos del mapa (tiles, raster, vectores) para fechas específicas | S3/MinIO + PostgreSQL table `map_snapshots` (metadata) |
| **Historical Data Processor** | Pipelines ETL que generan snapshots y rellenan la TS‑DB cada día | Apache Airflow, dbt, Python scripts |
| **Cache** | CDN para tiles y respuestas de API | CloudFront / Cloudflare, Redis (query cache) |

---  

## 2️⃣ Modelo de Datos  

### 2.1 Series Temporales (Variables por Sitio)

```sql
-- Table en TimescaleDB
CREATE TABLE site_measurements (
    site_id      UUID NOT NULL,
    variable     TEXT NOT NULL,          -- e.g. "sea_surface_temp"
    measured_at  TIMESTAMPTZ NOT NULL,
    value        DOUBLE PRECISION,
    PRIMARY KEY (site_id, variable, measured_at)
);
SELECT create_hypertable('site_measurements',
                         'measured_at',
                         chunk_time_interval => INTERVAL '1 day');
```

* **Ventajas:**  
  * Queries eficientes por rango de tiempo (`WHERE measured_at BETWEEN …`).  
  * Compresión automática (`timescaledb.compress`) para datos > 30 días.  

### 2.2 Snapshots del Mapa  

| columna | tipo | descripción |
|---------|------|-------------|
| `snapshot_id` | UUID | PK |
| `date` | DATE | Día de la captura (UTC) |
| `tile_z` | INT | Nivel de zoom |
| `tile_x` | INT | X del tile |
| `tile_y` | INT | Y del tile |
| `s3_key` | TEXT | Ruta en S3 (`snapshots/2024/03/15/z10/x523/y341.png`) |
| `created_at` | TIMESTAMPTZ | Cuando se generó el snapshot |

**Índice:** `CREATE UNIQUE INDEX ON map_snapshots(date, tile_z, tile_x, tile_y);`

Los snapshots se generan **una vez al día** (00:00 UTC) mediante un proceso batch que renderiza el mapa con la capa de datos del día anterior.

---  

## 3️⃣ Ingesta y Generación de Historicos  

### 3.1 Pipeline Diario (Airflow DAG)

```
dag: generate_daily_snapshot
 ├─ task: fetch_latest_site_data → write to TimescaleDB
 ├─ task: materialize_daily_view (SQL) → materialized view "site_snapshot_{{ ds }}"
 ├─ task: render_map_tiles (Python + Mapbox GL Native) → upload to S3
 └─ task: register_snapshot_metadata → INSERT into map_snapshots
```

* **`materialize_daily_view`** crea una tabla `site_snapshot_2024_03_15` con los valores *más recientes* antes de `2024‑03‑15 23:59:59`.  
* La vista está **particionada por día**, facilitando consultas rápidas.  

### 3.2 Retención  

| Tipo de dato | Retención | Compresión |
|--------------|-----------|------------|
| TimescaleDB (raw) | 1 año (configurable) | `timescaledb.compress` después de 30 días |
| Snapshots (S3) | 5 años (costo moderado) | Archiving a Glacier después de 2 años |

---  

## 4️⃣ API Design  

### 4.1 Endpoints Principales  

| Método | Ruta | Parámetros | Descripción |
|--------|------|------------|-------------|
| `GET` | `/api/v1/map` | `date=YYYY-MM-DD` (opcional, default=hoje) <br> `bbox=lon1,lat1,lon2,lat2` <br> `zoom=int` | Devuelve **tiles** (PNG/WEBP) o **GeoJSON** con datos de sitio del día solicitado. |
| `GET` | `/api/v1/sites/:siteId` | `date=YYYY-MM-DD` | Devuelve todas las variables del sitio para la fecha indicada (último valor del día). |
| `GET` | `/api/v1/dates` | — | Lista de fechas disponibles (útil para UI). |
| `GET` | `/api/v1/health` | — | Health‑check. |

### 4.2 Ejemplo de Implementación (Node/TS)

```ts
// src/routes/map.ts
router.get('/map', async (req, res) => {
  const { date, bbox, zoom } = req.query as {
    date?: string;
    bbox?: string;
    zoom?: string;
  };

  const targetDate = date ? new Date(date) : new Date(); // default today
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // 1️⃣ Si la petición es de tiles raster
  if (req.headers.accept?.includes('image/')) {
    const tileKey = await getTileKey(targetDate, Number(zoom), bbox);
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.S3_BUCKET!,
      Key: tileKey,
      Expires: 60,
    });
    return res.redirect(signedUrl);
  }

  // 2️⃣ Si la petición es GeoJSON
  const data = await db.query(`
    SELECT site_id, variable, value
    FROM site_measurements
    WHERE measured_at::date = $1
      AND ST_Contains(ST_MakeEnvelope($2,$3,$4,$5,4326), location)
  `, [targetDate.toISOString().split('T')[0], ...bbox.split(',').map(Number)]);

  res.json({ date: targetDate.toISOString().split('T')[0], features: data.rows });
});
```

### 4.3 Seguridad & Rate Limiting  

* **Auth:** JWT en header `Authorization: Bearer <token>`.  
* **Rate‑limit:** 60 req/min por IP usando `express-rate-limit`.  
* **CORS:** Solo dominios aprobados (`https://app.mau16ro.com`).  

---  

## 5️⃣ Front‑End – UI/UX  

### 5️⃣1 Selector de Fecha  

```tsx
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export const HistoricalMap = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const onChange = (date: Date) => {
    setSelectedDate(date);
    // trigger map reload
    fetchMap(date);
  };

  return (
    <div className="date-picker-wrapper">
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        maxDate={new Date()}               // no future dates
        dateFormat="yyyy-MM-dd"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        placeholderText="Select a past date"
      />
    </div>
  );
};
```

### 5️⃣2 Carga del Mapa  

```tsx
import MapGL, { Source, Layer } from 'react-map-gl';

const MapComponent = ({ date }: { date: Date }) => {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch(`/api/v1/map?date=${date.toISOString().split('T')[0]}&bbox=-180,-90,180,90&zoom=5`)
      .then(r => r.json())
      .then(setGeojson);
  }, [date]);

  return (
    <MapGL
      initialViewState={{ longitude: 150, latitude: -30, zoom: 5 }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
    >
      {geojson && (
        <Source type="geojson" data={geojson}>
          <Layer {...sitePointLayer} />
        </Source>
      )}
    </MapGL>
  );
};
```

### 5️⃣3 Experiencia de Usuario  

* **Feedback visual:** mientras carga, mostrar spinner + mensaje “Cargando datos del 2023‑12‑02…”.  
* **Cache local:** `localStorage` guarda la última fecha pedida para acelerar recargas.  
* **Fallback:** Si la fecha no está disponible, devolver mensaje amigable y lista de fechas válidas (`/api/v1/dates`).  

---  

## 6️⃣ Estrategia de Rendimiento  

| Problema | Solución |
|----------|----------|
| **Gran volumen de series temporales** | Particionar por día (`timescaledb`), usar **compression** y **continuous aggregates** (`CREATE MATERIALIZED VIEW daily_site_stats ...`). |
| **Latencia de tiles** | Servir tiles desde **CDN** (CloudFront) con TTL ≈ 1 día. |
| **Consultas repetitivas** | Cache en **Redis**: clave `map:{date}:{bbox}:{zoom}` → respuesta JSON (TTL = 12 h). |
| **Cargas de picos en fechas populares (ej. 2023‑12‑02)** | Pre‑warm en el CDN los tiles y datos de los últimos 30 días mediante “warm‑up job”. |
| **Costo de almacenamiento de snapshots** | Guardar en **S3 Intelligent‑Tiering**; mover a **Glacier** después de 2 años. |

---  

## 7️⃣ Pruebas  

### 7.1 Unit Tests  

* **Back‑end:** Jest + Supertest – validar que `/api/v1/map?date=2023-12-02` devuelve 200 y el tipo correcto.  
* **Front‑end:** React Testing Library – simular selección de fecha y verificar que la llamada fetch se realiza con el parámetro correcto.  

### 7.2 Integration Tests  

* **Docker‑Compose** con PostgreSQL + TimescaleDB + MinIO + API.  
* Ejecutar pruebas que inserten datos de varios días y comprueben que la respuesta coincide con el snapshot esperado.  

### 7.3 Load & Stress  

* **k6** script: 500 concurrent users solicitando distintas fechas.  
* Métricas objetivo: < 300 ms para respuestas JSON, < 500 ms para tiles (CDN).  

### 7.4 End‑to‑End (E2E)  

* **Cypress**: flujo completo – abrir la aplicación, elegir una fecha histórica, validar que los puntos del mapa y la leyenda coinciden con datos de referencia.  

---  

## 8️⃣