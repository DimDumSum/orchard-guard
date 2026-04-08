import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------------------------
// Types — existing
// ---------------------------------------------------------------------------

export interface WeatherHourlyRow {
  id?: number;
  station_id?: string;
  timestamp: string; // ISO 8601
  source: "open-meteo" | "env-canada" | "custom";
  temp_c?: number | null;
  humidity_pct?: number | null;
  precip_mm?: number | null;
  wind_kph?: number | null;
  leaf_wetness_hours?: number | null;
  dew_point_c?: number | null;
  created_at?: string;
}

export interface OrchardRow {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  primary_varieties: string; // JSON array
  rootstock: string | null;
  fire_blight_history: "none" | "nearby" | "in_orchard";
  bloom_stage:
    | "dormant"
    | "silver-tip"
    | "green-tip"
    | "tight-cluster"
    | "pink"
    | "bloom"
    | "petal-fall"
    | "fruit-set";
  codling_moth_biofix_date: string | null;
  petal_fall_date: string | null;
  last_updated: string;
  // v1 migration additions
  juniper_nearby: number;
  microclimate: "cool_wet" | "moderate" | "warm_dry";
  blocks: string; // JSON array
}

export interface AlertConfigRow {
  id: number;
  orchard_id: number;
  alert_type: string;
  threshold: string | null;
  email: string | null;
  phone: string | null;
  enabled: number;
  cooldown_hours: number;
}

export interface AlertLogRow {
  id: number;
  orchard_id: number;
  model: string;
  risk_level: string;
  message: string;
  sent_at: string;
  channel: string;
}

export interface SprayLogRow {
  id: number;
  orchard_id: number;
  date: string;
  product: string;
  rate: string | null;
  target: string;
  phi_days: number | null;
  rei_hours: number | null;
  notes: string | null;
  created_at: string;
  // v1 migration additions
  product_id: number | null;
  block_name: string | null;
  cost: number | null;
}

export interface WeatherDailyRow {
  station_id: string;
  date: string;
  max_temp: number | null;
  min_temp: number | null;
  mean_temp: number | null;
  total_precip: number | null;
  avg_humidity: number | null;
  max_humidity: number | null;
  leaf_wetness_hours: number | null;
  degree_hours_15_5: number | null;
  degree_hours_18_3: number | null;
  degree_hours_10: number | null;
  degree_days_base5: number | null;
  degree_days_base10: number | null;
}

// ---------------------------------------------------------------------------
// Types — new tables
// ---------------------------------------------------------------------------

export interface SchemaVersionRow {
  version: number;
  applied_at: string;
  description: string | null;
}

export interface SprayProductRow {
  id: number;
  product_name: string;
  active_ingredient: string;
  product_group: "fungicide" | "insecticide" | "miticide" | "growth_regulator" | "nutrient";
  frac_irac_group: string | null;
  target_pests: string; // JSON array
  rate_per_hectare: string | null;
  rate_per_acre: string | null;
  rate_unit: string | null;
  phi_days: number | null;
  rei_hours: number | null;
  max_applications_per_season: number | null;
  resistance_risk: "low" | "medium" | "high";
  organic_approved: number;
  rainfast_hours: number | null;
  kickback_hours: number | null;
  tank_mix_compatible: string; // JSON array
  tank_mix_incompatible: string; // JSON array
  cost_per_unit: number | null;
  unit_size: number | null;
  unit_measure: string | null;
  notes: string | null;
  label_url: string | null;
}

export interface InventoryRow {
  id: number;
  product_id: number;
  quantity_on_hand: number;
  unit_measure: string | null;
  lot_number: string | null;
  expiry_date: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  supplier: string | null;
  storage_location: string | null;
  notes: string | null;
}

export interface WorkerRow {
  id: number;
  orchard_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: string | null;
  notification_preference: "sms" | "email" | "both";
  active: number;
}

export interface SoilTestRow {
  id: number;
  orchard_id: number;
  date: string;
  pH: number | null;
  organic_matter_pct: number | null;
  n_ppm: number | null;
  p_ppm: number | null;
  k_ppm: number | null;
  ca_ppm: number | null;
  mg_ppm: number | null;
  b_ppm: number | null;
  zn_ppm: number | null;
  mn_ppm: number | null;
  cec: number | null;
  base_saturation: number | null;
  lab_name: string | null;
  notes: string | null;
}

export interface LeafTestRow {
  id: number;
  orchard_id: number;
  date: string;
  sample_type: "mid-season" | "post-harvest";
  n_pct: number | null;
  p_pct: number | null;
  k_pct: number | null;
  ca_pct: number | null;
  mg_pct: number | null;
  b_ppm: number | null;
  zn_ppm: number | null;
  mn_ppm: number | null;
  fe_ppm: number | null;
  cu_ppm: number | null;
  lab_name: string | null;
  notes: string | null;
}

export interface FertilizerLogRow {
  id: number;
  orchard_id: number;
  date: string;
  product_name: string;
  analysis: string | null;
  rate: number | null;
  rate_unit: string | null;
  method: "broadcast" | "foliar" | "fertigation" | "banded";
  target_nutrient: string | null;
  cost: number | null;
  notes: string | null;
}

export interface ScabInfectionLogRow {
  id: number;
  orchard_id: number;
  date: string;
  severity: "light" | "moderate" | "severe";
  mean_temp: number | null;
  wetness_hours: number | null;
  protected: number;
  fungicide_used: string | null;
  notes: string | null;
}

export interface TankMixTemplateRow {
  id: number;
  orchard_id: number;
  name: string;
  products: string; // JSON array
  tank_size_l: number | null;
  area_ha: number | null;
  notes: string | null;
  created_at: string;
}

export interface PlantedBlockRow {
  id: number;
  orchard_id: number;
  block_name: string;
  variety: string;
  rootstock: string | null;
  planted_year: number | null;
  tree_count: number | null;
  spacing_in_row_m: number | null;
  spacing_between_rows_m: number | null;
  area_ha: number | null;
  notes: string | null;
  created_at: string;
}

export interface OrchardBlockRow {
  id: number;
  orchard_id: number;
  block_name: string;
  total_area_ha: number | null;
  year_established: number | null;
  soil_type: string | null;
  irrigation_system: string | null;
  notes: string | null;
  created_at: string;
}

export interface BlockPlantingRow {
  id: number;
  block_id: number;
  variety: string;
  rootstock: string | null;
  tree_count: number | null;
  spacing_in_row_m: number | null;
  spacing_between_rows_m: number | null;
  rows_description: string | null;
  planted_year: number | null;
  sub_notes: string | null;
  created_at: string;
}

/** Block with its plantings pre-loaded for UI consumption */
export interface OrchardBlockWithPlantings extends OrchardBlockRow {
  plantings: BlockPlantingRow[];
}

// ---------------------------------------------------------------------------
// Singleton database instance — uses globalThis to survive Next.js module
// re-evaluation (HMR in dev, worker respawns in standalone production).
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __orchardguard_db: DatabaseType | undefined;
}

/**
 * Return the singleton better-sqlite3 database instance, creating it
 * (and running migrations) on first call.
 */
export function getDb(): DatabaseType {
  if (globalThis.__orchardguard_db) return globalThis.__orchardguard_db;

  const dbPath =
    process.env.DATABASE_PATH || path.join(process.cwd(), "data", "orchard.db");

  console.log(`[db] Opening database at: ${dbPath}`);

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance in Next.js
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  createBaseTables(db);
  runMigrations(db);

  console.log(`[db] Database initialized successfully (WAL mode)`);

  globalThis.__orchardguard_db = db;
  return db;
}

// ---------------------------------------------------------------------------
// Base schema — original CREATE TABLE IF NOT EXISTS statements
// ---------------------------------------------------------------------------

function createBaseTables(db: DatabaseType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS weather_hourly (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id          TEXT    DEFAULT 'default',
      timestamp           TEXT    NOT NULL,
      source              TEXT    NOT NULL CHECK(source IN ('open-meteo','env-canada','custom')),
      temp_c              REAL,
      humidity_pct        REAL,
      precip_mm           REAL,
      wind_kph            REAL,
      leaf_wetness_hours  REAL,
      dew_point_c         REAL,
      created_at          TEXT    DEFAULT (datetime('now')),
      UNIQUE(station_id, timestamp, source)
    );

    CREATE TABLE IF NOT EXISTS orchards (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      name                    TEXT    NOT NULL,
      latitude                REAL    NOT NULL,
      longitude               REAL    NOT NULL,
      elevation_m             REAL    DEFAULT 0,
      primary_varieties       TEXT    DEFAULT '[]',
      rootstock               TEXT,
      fire_blight_history     TEXT    DEFAULT 'none'
                                      CHECK(fire_blight_history IN ('none','nearby','in_orchard')),
      bloom_stage             TEXT    DEFAULT 'dormant'
                                      CHECK(bloom_stage IN (
                                        'dormant','silver-tip','green-tip','tight-cluster',
                                        'pink','bloom','petal-fall','fruit-set'
                                      )),
      codling_moth_biofix_date TEXT,
      petal_fall_date         TEXT,
      last_updated            TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alert_config (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      orchard_id      INTEGER REFERENCES orchards(id),
      alert_type      TEXT    NOT NULL,
      threshold       TEXT,
      email           TEXT,
      phone           TEXT,
      enabled         INTEGER DEFAULT 1,
      cooldown_hours  INTEGER DEFAULT 12
    );

    CREATE TABLE IF NOT EXISTS alert_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      orchard_id  INTEGER REFERENCES orchards(id),
      model       TEXT    NOT NULL,
      risk_level  TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      sent_at     TEXT    DEFAULT (datetime('now')),
      channel     TEXT    DEFAULT 'dashboard'
    );

    CREATE TABLE IF NOT EXISTS spray_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      orchard_id  INTEGER REFERENCES orchards(id),
      date        TEXT    NOT NULL,
      product     TEXT    NOT NULL,
      rate        TEXT,
      target      TEXT    NOT NULL,
      phi_days    INTEGER,
      rei_hours   INTEGER,
      notes       TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schema_version (
      version     INTEGER PRIMARY KEY,
      applied_at  TEXT    DEFAULT (datetime('now')),
      description TEXT
    );
  `);

  // ------------------------------------------------------------------
  // Daily aggregation view
  //
  // degree_hours_*  – hourly excess over the given base temperature,
  //                   summed for the day.
  // degree_days_*   – classic (max+min)/2 - base formula (single value
  //                   per day, floored at 0).
  // ------------------------------------------------------------------
  db.exec(`
    CREATE VIEW IF NOT EXISTS weather_daily AS
    SELECT
      station_id,
      date(timestamp)                                       AS date,
      max(temp_c)                                           AS max_temp,
      min(temp_c)                                           AS min_temp,
      avg(temp_c)                                           AS mean_temp,
      sum(precip_mm)                                        AS total_precip,
      avg(humidity_pct)                                     AS avg_humidity,
      max(humidity_pct)                                     AS max_humidity,
      sum(leaf_wetness_hours)                               AS leaf_wetness_hours,
      sum(max(temp_c - 15.5, 0))                            AS degree_hours_15_5,
      sum(max(temp_c - 18.3, 0))                            AS degree_hours_18_3,
      sum(max(temp_c - 10.0, 0))                            AS degree_hours_10,
      max((max(temp_c) + min(temp_c)) / 2.0 - 5.0,  0)     AS degree_days_base5,
      max((max(temp_c) + min(temp_c)) / 2.0 - 10.0, 0)     AS degree_days_base10
    FROM weather_hourly
    GROUP BY station_id, date(timestamp);
  `);

  // ------------------------------------------------------------------
  // Seed a default orchard row if the table is empty
  // ------------------------------------------------------------------
  const count = db
    .prepare("SELECT count(*) AS cnt FROM orchards")
    .get() as { cnt: number };

  if (count.cnt === 0) {
    db.prepare(
      `INSERT INTO orchards (name, latitude, longitude, primary_varieties, fire_blight_history)
       VALUES (?, ?, ?, ?, ?)`
    ).run("My Apple Orchard", 43.65, -79.38, JSON.stringify(["honeycrisp", "gala", "mcintosh"]), "in_orchard");
  }
}

// ---------------------------------------------------------------------------
// Migration system
// ---------------------------------------------------------------------------

interface Migration {
  version: number;
  description: string;
  up: (db: DatabaseType) => void;
}

function getCurrentSchemaVersion(db: DatabaseType): number {
  const row = db
    .prepare("SELECT max(version) AS v FROM schema_version")
    .get() as { v: number | null } | undefined;
  return row?.v ?? 0;
}

/**
 * Check for a column in a table using PRAGMA table_info.
 * Returns true if the column already exists.
 */
function columnExists(db: DatabaseType, table: string, column: string): boolean {
  const cols = db.pragma(`table_info(${table})`) as Array<{ name: string }>;
  return cols.some((c) => c.name === column);
}

/**
 * Run all unapplied migrations in order. Each migration is wrapped in a
 * transaction so that a failure rolls back that single migration and does
 * not leave the database in an inconsistent state.
 */
function runMigrations(db: DatabaseType): void {
  const current = getCurrentSchemaVersion(db);

  for (const migration of migrations) {
    if (migration.version <= current) continue;

    try {
      db.transaction(() => {
        migration.up(db);
        db.prepare(
          "INSERT INTO schema_version (version, description) VALUES (?, ?)"
        ).run(migration.version, migration.description);
      })();
      // eslint-disable-next-line no-console
      console.log(
        `[db] Migration v${migration.version} applied: ${migration.description}`
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `[db] Migration v${migration.version} FAILED (rolled back): ${migration.description}`,
        err
      );
      // Stop processing further migrations — later ones may depend on this one.
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Migration definitions
// ---------------------------------------------------------------------------

const migrations: Migration[] = [
  // -----------------------------------------------------------------------
  // v1 — Add new tables and columns
  // -----------------------------------------------------------------------
  {
    version: 1,
    description: "Add spray_products, inventory, workers, soil/leaf tests, fertilizer/scab logs, tank_mix_templates; extend orchards and spray_log",
    up(db: DatabaseType) {
      // --- New tables --------------------------------------------------

      db.exec(`
        CREATE TABLE IF NOT EXISTS spray_products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_name TEXT NOT NULL,
          active_ingredient TEXT NOT NULL,
          product_group TEXT NOT NULL CHECK(product_group IN ('fungicide','insecticide','miticide','growth_regulator','nutrient')),
          frac_irac_group TEXT,
          target_pests TEXT DEFAULT '[]',
          rate_per_hectare TEXT,
          rate_per_acre TEXT,
          rate_unit TEXT,
          phi_days INTEGER,
          rei_hours INTEGER,
          max_applications_per_season INTEGER,
          resistance_risk TEXT DEFAULT 'low' CHECK(resistance_risk IN ('low','medium','high')),
          organic_approved INTEGER DEFAULT 0,
          rainfast_hours INTEGER,
          kickback_hours INTEGER,
          tank_mix_compatible TEXT DEFAULT '[]',
          tank_mix_incompatible TEXT DEFAULT '[]',
          cost_per_unit REAL,
          unit_size REAL,
          unit_measure TEXT,
          notes TEXT,
          label_url TEXT
        );

        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER REFERENCES spray_products(id),
          quantity_on_hand REAL NOT NULL DEFAULT 0,
          unit_measure TEXT,
          lot_number TEXT,
          expiry_date TEXT,
          purchase_date TEXT,
          purchase_price REAL,
          supplier TEXT,
          storage_location TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS workers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          role TEXT,
          notification_preference TEXT DEFAULT 'email' CHECK(notification_preference IN ('sms','email','both')),
          active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS soil_tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          pH REAL,
          organic_matter_pct REAL,
          n_ppm REAL, p_ppm REAL, k_ppm REAL, ca_ppm REAL, mg_ppm REAL,
          b_ppm REAL, zn_ppm REAL, mn_ppm REAL,
          cec REAL,
          base_saturation REAL,
          lab_name TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS leaf_tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          sample_type TEXT DEFAULT 'mid-season' CHECK(sample_type IN ('mid-season','post-harvest')),
          n_pct REAL, p_pct REAL, k_pct REAL, ca_pct REAL, mg_pct REAL,
          b_ppm REAL, zn_ppm REAL, mn_ppm REAL, fe_ppm REAL, cu_ppm REAL,
          lab_name TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS fertilizer_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          product_name TEXT NOT NULL,
          analysis TEXT,
          rate REAL,
          rate_unit TEXT,
          method TEXT DEFAULT 'broadcast' CHECK(method IN ('broadcast','foliar','fertigation','banded')),
          target_nutrient TEXT,
          cost REAL,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS scab_infection_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          severity TEXT NOT NULL CHECK(severity IN ('light','moderate','severe')),
          mean_temp REAL,
          wetness_hours REAL,
          protected INTEGER DEFAULT 0,
          fungicide_used TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS tank_mix_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          name TEXT NOT NULL,
          products TEXT NOT NULL DEFAULT '[]',
          tank_size_l REAL,
          area_ha REAL,
          notes TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);

      // --- ALTER TABLE: orchards columns --------------------------------

      if (!columnExists(db, "orchards", "juniper_nearby")) {
        db.exec("ALTER TABLE orchards ADD COLUMN juniper_nearby INTEGER DEFAULT 0");
      }
      if (!columnExists(db, "orchards", "microclimate")) {
        db.exec("ALTER TABLE orchards ADD COLUMN microclimate TEXT DEFAULT 'moderate'");
      }
      if (!columnExists(db, "orchards", "blocks")) {
        db.exec("ALTER TABLE orchards ADD COLUMN blocks TEXT DEFAULT '[]'");
      }

      // --- ALTER TABLE: spray_log columns -------------------------------

      if (!columnExists(db, "spray_log", "product_id")) {
        db.exec("ALTER TABLE spray_log ADD COLUMN product_id INTEGER REFERENCES spray_products(id)");
      }
      if (!columnExists(db, "spray_log", "block_name")) {
        db.exec("ALTER TABLE spray_log ADD COLUMN block_name TEXT");
      }
      if (!columnExists(db, "spray_log", "cost")) {
        db.exec("ALTER TABLE spray_log ADD COLUMN cost REAL");
      }
    },
  },

  // -----------------------------------------------------------------------
  // v2 — Seed spray products (Ontario apple products)
  // -----------------------------------------------------------------------
  {
    version: 2,
    description: "Seed Ontario apple spray products catalogue",
    up(db: DatabaseType) {
      // Only seed if the table is empty (idempotent check)
      const existing = db
        .prepare("SELECT count(*) AS cnt FROM spray_products")
        .get() as { cnt: number };
      if (existing.cnt > 0) return;

      const insert = db.prepare(`
        INSERT INTO spray_products (
          product_name, active_ingredient, product_group, frac_irac_group,
          target_pests, phi_days, rei_hours, max_applications_per_season,
          resistance_risk, organic_approved, rainfast_hours, kickback_hours, notes
        ) VALUES (
          @product_name, @active_ingredient, @product_group, @frac_irac_group,
          @target_pests, @phi_days, @rei_hours, @max_applications_per_season,
          @resistance_risk, @organic_approved, @rainfast_hours, @kickback_hours, @notes
        )
      `);

      const products = [
        // ---- Fungicides ------------------------------------------------
        {
          product_name: "Captan 80 WDG",
          active_ingredient: "captan",
          product_group: "fungicide",
          frac_irac_group: "M4",
          target_pests: JSON.stringify(["apple_scab", "black_rot", "brooks_spot"]),
          phi_days: 1,
          rei_hours: 24,
          max_applications_per_season: 8,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: 2,
          kickback_hours: 0,
          notes: null,
        },
        {
          product_name: "Dithane M-45",
          active_ingredient: "mancozeb",
          product_group: "fungicide",
          frac_irac_group: "M3",
          target_pests: JSON.stringify(["apple_scab", "cedar_rust", "black_rot"]),
          phi_days: 45,
          rei_hours: 24,
          max_applications_per_season: 8,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: 4,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Nova 40W",
          active_ingredient: "myclobutanil",
          product_group: "fungicide",
          frac_irac_group: "3",
          target_pests: JSON.stringify(["apple_scab", "powdery_mildew", "cedar_rust"]),
          phi_days: 14,
          rei_hours: 24,
          max_applications_per_season: 6,
          resistance_risk: "medium",
          organic_approved: 0,
          rainfast_hours: 1,
          kickback_hours: 72,
          notes: null,
        },
        {
          product_name: "Merivon",
          active_ingredient: "fluxapyroxad+pyraclostrobin",
          product_group: "fungicide",
          frac_irac_group: "7+11",
          target_pests: JSON.stringify(["apple_scab", "powdery_mildew", "sooty_blotch"]),
          phi_days: 30,
          rei_hours: 12,
          max_applications_per_season: 4,
          resistance_risk: "high",
          organic_approved: 0,
          rainfast_hours: 2,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Inspire Super",
          active_ingredient: "difenoconazole+cyprodinil",
          product_group: "fungicide",
          frac_irac_group: "3+9",
          target_pests: JSON.stringify(["apple_scab", "powdery_mildew"]),
          phi_days: 14,
          rei_hours: 12,
          max_applications_per_season: 4,
          resistance_risk: "medium",
          organic_approved: 0,
          rainfast_hours: 2,
          kickback_hours: 96,
          notes: null,
        },
        {
          product_name: "Syllit 400",
          active_ingredient: "dodine",
          product_group: "fungicide",
          frac_irac_group: "U12",
          target_pests: JSON.stringify(["apple_scab"]),
          phi_days: 7,
          rei_hours: 48,
          max_applications_per_season: 4,
          resistance_risk: "medium",
          organic_approved: 0,
          rainfast_hours: 2,
          kickback_hours: 48,
          notes: null,
        },
        {
          product_name: "Flint",
          active_ingredient: "trifloxystrobin",
          product_group: "fungicide",
          frac_irac_group: "11",
          target_pests: JSON.stringify(["apple_scab", "powdery_mildew", "sooty_blotch"]),
          phi_days: 14,
          rei_hours: 12,
          max_applications_per_season: 4,
          resistance_risk: "high",
          organic_approved: 0,
          rainfast_hours: 2,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Copper 53W",
          active_ingredient: "copper hydroxide",
          product_group: "fungicide",
          frac_irac_group: "M1",
          target_pests: JSON.stringify(["fire_blight", "apple_scab"]),
          phi_days: 1,
          rei_hours: 24,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Pre-bloom use only for scab. Fire blight: apply at green tip to tight cluster.",
        },
        {
          product_name: "Streptomycin",
          active_ingredient: "streptomycin sulfate",
          product_group: "fungicide",
          frac_irac_group: "antibiotic",
          target_pests: JSON.stringify(["fire_blight"]),
          phi_days: 50,
          rei_hours: 12,
          max_applications_per_season: 3,
          resistance_risk: "high",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Apply during bloom. Rotate with Kasumin.",
        },
        {
          product_name: "Kasumin 2L",
          active_ingredient: "kasugamycin",
          product_group: "fungicide",
          frac_irac_group: "antibiotic",
          target_pests: JSON.stringify(["fire_blight"]),
          phi_days: 45,
          rei_hours: 12,
          max_applications_per_season: 4,
          resistance_risk: "medium",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Apply during bloom. Alternate with streptomycin.",
        },
        {
          product_name: "Blossom Protect",
          active_ingredient: "Aureobasidium pullulans",
          product_group: "fungicide",
          frac_irac_group: "biological",
          target_pests: JSON.stringify(["fire_blight"]),
          phi_days: 0,
          rei_hours: 4,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 1,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Apply 2-3 days BEFORE risk event. Not compatible with copper.",
        },
        {
          product_name: "Serenade OPTI",
          active_ingredient: "Bacillus subtilis",
          product_group: "fungicide",
          frac_irac_group: "biological",
          target_pests: JSON.stringify(["fire_blight", "apple_scab"]),
          phi_days: 0,
          rei_hours: 4,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 1,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Sulfur",
          active_ingredient: "sulfur",
          product_group: "fungicide",
          frac_irac_group: "M2",
          target_pests: JSON.stringify(["powdery_mildew"]),
          phi_days: 1,
          rei_hours: 24,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 1,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Do not apply within 14 days of oil.",
        },

        // ---- Insecticides ----------------------------------------------
        {
          product_name: "Admire 240F",
          active_ingredient: "imidacloprid",
          product_group: "insecticide",
          frac_irac_group: "4A",
          target_pests: JSON.stringify(["aphids", "leafminers"]),
          phi_days: 7,
          rei_hours: 12,
          max_applications_per_season: 1,
          resistance_risk: "medium",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Assail 70WP",
          active_ingredient: "acetamiprid",
          product_group: "insecticide",
          frac_irac_group: "4A",
          target_pests: JSON.stringify(["codling_moth", "aphids", "plum_curculio"]),
          phi_days: 7,
          rei_hours: 12,
          max_applications_per_season: 4,
          resistance_risk: "medium",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Altacor",
          active_ingredient: "chlorantraniliprole",
          product_group: "insecticide",
          frac_irac_group: "28",
          target_pests: JSON.stringify(["codling_moth", "leafrollers"]),
          phi_days: 5,
          rei_hours: 12,
          max_applications_per_season: 4,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Imidan 70WP",
          active_ingredient: "phosmet",
          product_group: "insecticide",
          frac_irac_group: "1B",
          target_pests: JSON.stringify(["codling_moth", "plum_curculio", "apple_maggot"]),
          phi_days: 14,
          rei_hours: 24,
          max_applications_per_season: 6,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Sevin XLR",
          active_ingredient: "carbaryl",
          product_group: "insecticide",
          frac_irac_group: "1A",
          target_pests: JSON.stringify(["codling_moth", "apple_maggot"]),
          phi_days: 3,
          rei_hours: 12,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Also used for fruit thinning.",
        },
        {
          product_name: "Entrust SC",
          active_ingredient: "spinosad",
          product_group: "insecticide",
          frac_irac_group: "5",
          target_pests: JSON.stringify(["codling_moth", "leafrollers"]),
          phi_days: 7,
          rei_hours: 12,
          max_applications_per_season: 3,
          resistance_risk: "medium",
          organic_approved: 1,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Surround WP",
          active_ingredient: "kaolin clay",
          product_group: "insecticide",
          frac_irac_group: "barrier",
          target_pests: JSON.stringify(["plum_curculio", "apple_maggot"]),
          phi_days: 0,
          rei_hours: 4,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 1,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Superior Oil",
          active_ingredient: "mineral oil",
          product_group: "insecticide",
          frac_irac_group: "oil",
          target_pests: JSON.stringify(["mite_eggs", "scale"]),
          phi_days: 0,
          rei_hours: 12,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: "Do not apply within 14 days of sulfur or captan.",
        },

        // ---- Growth Regulators -----------------------------------------
        {
          product_name: "Apogee",
          active_ingredient: "prohexadione-calcium",
          product_group: "growth_regulator",
          frac_irac_group: null,
          target_pests: JSON.stringify(["shoot_growth", "fire_blight_reduction"]),
          phi_days: 45,
          rei_hours: 12,
          max_applications_per_season: 2,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Fruitone-N",
          active_ingredient: "NAA",
          product_group: "growth_regulator",
          frac_irac_group: null,
          target_pests: JSON.stringify(["thinning"]),
          phi_days: 7,
          rei_hours: 12,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "MaxCel",
          active_ingredient: "6-BA",
          product_group: "growth_regulator",
          frac_irac_group: null,
          target_pests: JSON.stringify(["thinning"]),
          phi_days: 7,
          rei_hours: 12,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Ethrel",
          active_ingredient: "ethephon",
          product_group: "growth_regulator",
          frac_irac_group: null,
          target_pests: JSON.stringify(["preharvest_drop"]),
          phi_days: 7,
          rei_hours: 24,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "ReTain",
          active_ingredient: "AVG",
          product_group: "growth_regulator",
          frac_irac_group: null,
          target_pests: JSON.stringify(["preharvest_drop", "delayed_maturity"]),
          phi_days: 7,
          rei_hours: 12,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
        {
          product_name: "Harvista",
          active_ingredient: "1-MCP",
          product_group: "growth_regulator",
          frac_irac_group: null,
          target_pests: JSON.stringify(["preharvest", "storage_quality"]),
          phi_days: 3,
          rei_hours: 12,
          max_applications_per_season: null,
          resistance_risk: "low",
          organic_approved: 0,
          rainfast_hours: null,
          kickback_hours: null,
          notes: null,
        },
      ];

      for (const p of products) {
        insert.run(p);
      }
    },
  },
  // -----------------------------------------------------------------------
  // v3 — Add scouting tables (reference images + scouting photos)
  // -----------------------------------------------------------------------
  {
    version: 3,
    description: "Add reference_images and scouting_photos tables",
    up(db: DatabaseType) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS reference_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          model_slug TEXT NOT NULL,
          image_url TEXT NOT NULL,
          caption TEXT NOT NULL,
          credit TEXT,
          sort_order INTEGER DEFAULT 0,
          image_type TEXT CHECK(image_type IN ('symptom','lifecycle','damage','scouting','management'))
        );

        CREATE TABLE IF NOT EXISTS scouting_photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          model_slug TEXT,
          date TEXT NOT NULL,
          file_path TEXT NOT NULL,
          notes TEXT,
          block TEXT,
          severity TEXT CHECK(severity IN ('trace','light','moderate','severe')),
          created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_reference_images_slug ON reference_images(model_slug);
        CREATE INDEX IF NOT EXISTS idx_scouting_photos_slug ON scouting_photos(model_slug);
      `);
    },
  },
  // -----------------------------------------------------------------------
  // v4 — Add irrigation management tables
  // -----------------------------------------------------------------------
  {
    version: 4,
    description: "Add irrigation_config, water_balance, irrigation_log, irrigation_rainfall_manual tables",
    up(db: DatabaseType) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS irrigation_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id) UNIQUE,
          enabled INTEGER DEFAULT 0,
          soil_type TEXT DEFAULT 'loam' CHECK(soil_type IN ('sand','loamy-sand','sandy-loam','loam','clay-loam','clay')),
          root_depth_cm REAL DEFAULT 60,
          field_capacity_mm REAL DEFAULT 186,
          wilting_point_mm REAL DEFAULT 72,
          available_water_mm REAL DEFAULT 114,
          management_allowable_depletion REAL DEFAULT 0.50,
          irrigation_type TEXT DEFAULT 'none' CHECK(irrigation_type IN ('drip','micro-sprinkler','overhead','none')),
          irrigation_rate_mm_per_hour REAL DEFAULT 4,
          water_cost_per_m3 REAL DEFAULT 0.06,
          block_area_ha REAL DEFAULT 1.0,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS water_balance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          rainfall_mm REAL DEFAULT 0,
          effective_rainfall_mm REAL DEFAULT 0,
          irrigation_mm REAL DEFAULT 0,
          et_reference_mm REAL DEFAULT 0,
          crop_coefficient REAL DEFAULT 0.65,
          et_crop_mm REAL DEFAULT 0,
          soil_water_mm REAL DEFAULT 0,
          depletion_mm REAL DEFAULT 0,
          depletion_pct REAL DEFAULT 0,
          deep_drainage_mm REAL DEFAULT 0,
          status TEXT DEFAULT 'optimal',
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(orchard_id, date)
        );

        CREATE TABLE IF NOT EXISTS irrigation_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          duration_hours REAL,
          amount_mm REAL NOT NULL,
          source TEXT DEFAULT 'drip',
          water_volume_m3 REAL,
          cost REAL,
          notes TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS irrigation_rainfall_manual (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id),
          date TEXT NOT NULL,
          amount_mm REAL NOT NULL,
          source TEXT DEFAULT 'gauge' CHECK(source IN ('gauge','estimate')),
          notes TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(orchard_id, date)
        );

        CREATE INDEX IF NOT EXISTS idx_water_balance_date ON water_balance(orchard_id, date);
        CREATE INDEX IF NOT EXISTS idx_irrigation_log_date ON irrigation_log(orchard_id, date);
      `);
    },
  },

  // -----------------------------------------------------------------------
  // v5 — Add planted_blocks table
  // -----------------------------------------------------------------------
  {
    version: 5,
    description: "Add planted_blocks table for structured variety + rootstock tracking per block",
    up(db: DatabaseType) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS planted_blocks (
          id                    INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id            INTEGER NOT NULL REFERENCES orchards(id),
          block_name            TEXT    NOT NULL,
          variety               TEXT    NOT NULL,
          rootstock             TEXT,
          planted_year          INTEGER,
          tree_count            INTEGER,
          spacing_in_row_m      REAL,
          spacing_between_rows_m REAL,
          area_ha               REAL,
          notes                 TEXT,
          created_at            TEXT    DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_planted_blocks_orchard
          ON planted_blocks(orchard_id);
      `);
    },
  },

  // -----------------------------------------------------------------------
  // v6 — Add orchard_blocks + block_plantings (block-level + planting-level)
  // -----------------------------------------------------------------------
  {
    version: 6,
    description: "Add orchard_blocks and block_plantings tables for multi-variety blocks",
    up(db: DatabaseType) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS orchard_blocks (
          id                INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id        INTEGER NOT NULL REFERENCES orchards(id),
          block_name        TEXT    NOT NULL,
          total_area_ha     REAL,
          year_established  INTEGER,
          soil_type         TEXT,
          irrigation_system TEXT,
          notes             TEXT,
          created_at        TEXT    DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_orchard_blocks_orchard
          ON orchard_blocks(orchard_id);

        CREATE TABLE IF NOT EXISTS block_plantings (
          id                    INTEGER PRIMARY KEY AUTOINCREMENT,
          block_id              INTEGER NOT NULL REFERENCES orchard_blocks(id) ON DELETE CASCADE,
          variety               TEXT    NOT NULL,
          rootstock             TEXT,
          tree_count            INTEGER,
          spacing_in_row_m      REAL,
          spacing_between_rows_m REAL,
          rows_description      TEXT,
          planted_year          INTEGER,
          sub_notes             TEXT,
          created_at            TEXT    DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_block_plantings_block
          ON block_plantings(block_id);
      `);
    },
  },

  // -----------------------------------------------------------------------
  // v7 — Add irrigation system specs + travelling-gun type
  // -----------------------------------------------------------------------
  {
    version: 7,
    description: "Add irrigation_system_specs column and travelling-gun irrigation type",
    up(db: DatabaseType) {
      // Add JSON column for hardware-specific specs
      db.exec(`ALTER TABLE irrigation_config ADD COLUMN irrigation_system_specs TEXT`);

      // Recreate table to update CHECK constraint for irrigation_type
      db.exec(`
        CREATE TABLE irrigation_config_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id INTEGER REFERENCES orchards(id) UNIQUE,
          enabled INTEGER DEFAULT 0,
          soil_type TEXT DEFAULT 'loam' CHECK(soil_type IN ('sand','loamy-sand','sandy-loam','loam','clay-loam','clay')),
          root_depth_cm REAL DEFAULT 60,
          field_capacity_mm REAL DEFAULT 186,
          wilting_point_mm REAL DEFAULT 72,
          available_water_mm REAL DEFAULT 114,
          management_allowable_depletion REAL DEFAULT 0.50,
          irrigation_type TEXT DEFAULT 'none' CHECK(irrigation_type IN ('drip','micro-sprinkler','overhead','travelling-gun','none')),
          irrigation_rate_mm_per_hour REAL DEFAULT 4,
          irrigation_system_specs TEXT,
          water_cost_per_m3 REAL DEFAULT 0.06,
          block_area_ha REAL DEFAULT 1.0,
          notes TEXT
        );

        INSERT INTO irrigation_config_new (
          id, orchard_id, enabled, soil_type, root_depth_cm, field_capacity_mm,
          wilting_point_mm, available_water_mm, management_allowable_depletion,
          irrigation_type, irrigation_rate_mm_per_hour, water_cost_per_m3,
          block_area_ha, notes
        )
        SELECT
          id, orchard_id, enabled, soil_type, root_depth_cm, field_capacity_mm,
          wilting_point_mm, available_water_mm, management_allowable_depletion,
          irrigation_type, irrigation_rate_mm_per_hour, water_cost_per_m3,
          block_area_ha, notes
        FROM irrigation_config;

        DROP TABLE irrigation_config;
        ALTER TABLE irrigation_config_new RENAME TO irrigation_config;
      `);
    },
  },

  // -----------------------------------------------------------------------
  // v8 — Add performance indexes for weather and spray log queries
  // -----------------------------------------------------------------------
  {
    version: 8,
    description: "Add indexes on weather_hourly and spray_log for query performance",
    up(db: DatabaseType) {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_weather_hourly_station_timestamp
          ON weather_hourly (station_id, timestamp);

        CREATE INDEX IF NOT EXISTS idx_spray_log_orchard_date
          ON spray_log (orchard_id, date);

        CREATE INDEX IF NOT EXISTS idx_alert_log_orchard_sent
          ON alert_log (orchard_id, sent_at);
      `);
    },
  },
  {
    version: 9,
    description: "Add model_cache table for offline resilience",
    up(db: DatabaseType) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS model_cache (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          orchard_id  INTEGER REFERENCES orchards(id),
          cache_key   TEXT NOT NULL DEFAULT 'all_models',
          result_json TEXT NOT NULL,
          cached_at   TEXT DEFAULT (datetime('now')),
          UNIQUE(orchard_id, cache_key)
        );
      `);
    },
  },
];

// ---------------------------------------------------------------------------
// Types — scouting tables
// ---------------------------------------------------------------------------

export interface ReferenceImageRow {
  id: number;
  model_slug: string;
  image_url: string;
  caption: string;
  credit: string | null;
  sort_order: number;
  image_type: "symptom" | "lifecycle" | "damage" | "scouting" | "management";
}

export interface ScoutingPhotoRow {
  id: number;
  orchard_id: number;
  model_slug: string;
  date: string;
  file_path: string;
  notes: string | null;
  block: string | null;
  severity: "trace" | "light" | "moderate" | "severe" | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helper functions — scouting
// ---------------------------------------------------------------------------

export function getReferenceImages(slug: string): ReferenceImageRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM reference_images WHERE model_slug = ? ORDER BY sort_order")
    .all(slug) as ReferenceImageRow[];
}

export function getScoutingPhotos(slug: string, orchardId: number = 1): ScoutingPhotoRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM scouting_photos WHERE model_slug = ? AND orchard_id = ? ORDER BY date DESC")
    .all(slug, orchardId) as ScoutingPhotoRow[];
}

export function insertScoutingPhoto(row: Omit<ScoutingPhotoRow, "id" | "created_at">): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO scouting_photos (orchard_id, model_slug, date, file_path, notes, block, severity)
    VALUES (@orchard_id, @model_slug, @date, @file_path, @notes, @block, @severity)
  `).run({
    orchard_id: row.orchard_id,
    model_slug: row.model_slug,
    date: row.date,
    file_path: row.file_path,
    notes: row.notes ?? null,
    block: row.block ?? null,
    severity: row.severity ?? null,
  });
  return Number(result.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Helper functions — existing
// ---------------------------------------------------------------------------

/**
 * Retrieve an orchard by id. Defaults to id = 1 when no argument is given.
 */
export function getOrchard(id: number = 1): OrchardRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM orchards WHERE id = ?")
    .get(id) as OrchardRow | undefined;
}

/**
 * Bulk upsert hourly weather rows.
 *
 * Uses INSERT ... ON CONFLICT to update existing rows that match the
 * (station_id, timestamp, source) unique constraint.
 */
export function upsertWeatherHourly(rows: WeatherHourlyRow[]): void {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO weather_hourly
      (station_id, timestamp, source, temp_c, humidity_pct,
       precip_mm, wind_kph, leaf_wetness_hours, dew_point_c)
    VALUES
      (@station_id, @timestamp, @source, @temp_c, @humidity_pct,
       @precip_mm, @wind_kph, @leaf_wetness_hours, @dew_point_c)
    ON CONFLICT(station_id, timestamp, source) DO UPDATE SET
      temp_c             = excluded.temp_c,
      humidity_pct       = excluded.humidity_pct,
      precip_mm          = excluded.precip_mm,
      wind_kph           = excluded.wind_kph,
      leaf_wetness_hours = excluded.leaf_wetness_hours,
      dew_point_c        = excluded.dew_point_c
  `);

  const upsertMany = db.transaction((items: WeatherHourlyRow[]) => {
    for (const row of items) {
      stmt.run({
        station_id: row.station_id ?? "default",
        timestamp: row.timestamp,
        source: row.source,
        temp_c: row.temp_c ?? null,
        humidity_pct: row.humidity_pct ?? null,
        precip_mm: row.precip_mm ?? null,
        wind_kph: row.wind_kph ?? null,
        leaf_wetness_hours: row.leaf_wetness_hours ?? null,
        dew_point_c: row.dew_point_c ?? null,
      });
    }
  });

  upsertMany(rows);
}

/**
 * Retrieve hourly weather rows for a station within a date range (inclusive).
 *
 * @param stationId  Station identifier (defaults to "default")
 * @param startDate  ISO 8601 date string (e.g. "2026-04-01")
 * @param endDate    ISO 8601 date string (e.g. "2026-04-07")
 */
export function getWeatherRange(
  stationId: string,
  startDate: string,
  endDate: string
): WeatherHourlyRow[] {
  const db = getDb();
  // When multiple sources exist for the same timestamp, prefer real
  // station observations (env-canada) over model data (open-meteo).
  // The subquery picks the best row per timestamp using source priority.
  return db
    .prepare(
      `SELECT * FROM weather_hourly
       WHERE station_id = ?
         AND timestamp >= ?
         AND timestamp < datetime(?, '+1 day')
         AND id IN (
           SELECT id FROM (
             SELECT id, ROW_NUMBER() OVER (
               PARTITION BY station_id, timestamp
               ORDER BY CASE source
                 WHEN 'env-canada' THEN 1
                 WHEN 'custom' THEN 2
                 WHEN 'open-meteo' THEN 3
                 ELSE 4
               END
             ) AS rn
             FROM weather_hourly
             WHERE station_id = ?
               AND timestamp >= ?
               AND timestamp < datetime(?, '+1 day')
           ) WHERE rn = 1
         )
       ORDER BY timestamp`
    )
    .all(stationId, startDate, endDate, stationId, startDate, endDate) as WeatherHourlyRow[];
}

/**
 * Retrieve daily-aggregated weather data from the weather_daily view.
 *
 * @param stationId  Station identifier (defaults to "default")
 * @param startDate  ISO 8601 date string (e.g. "2026-04-01")
 * @param endDate    ISO 8601 date string (e.g. "2026-04-07")
 */
export function getDailyWeather(
  stationId: string,
  startDate: string,
  endDate: string
): WeatherDailyRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM weather_daily
       WHERE station_id = ?
         AND date >= ?
         AND date <= ?
       ORDER BY date`
    )
    .all(stationId, startDate, endDate) as WeatherDailyRow[];
}

// ---------------------------------------------------------------------------
// Helper functions — new
// ---------------------------------------------------------------------------

/**
 * Get spray products, optionally filtered by product_group or target_pests.
 */
export function getSprayProducts(filters?: {
  product_group?: string;
  target_pest?: string;
}): SprayProductRow[] {
  const db = getDb();

  if (!filters) {
    return db.prepare("SELECT * FROM spray_products ORDER BY product_name").all() as SprayProductRow[];
  }

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.product_group) {
    clauses.push("product_group = ?");
    params.push(filters.product_group);
  }

  if (filters.target_pest) {
    // target_pests is stored as a JSON array string, e.g. '["apple_scab","black_rot"]'
    // Use LIKE with the value embedded to match within the JSON array.
    clauses.push("target_pests LIKE ?");
    params.push(`%"${filters.target_pest}"%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(`SELECT * FROM spray_products ${where} ORDER BY product_name`)
    .all(...params) as SprayProductRow[];
}

/**
 * Get inventory rows, optionally filtered to a specific product.
 */
export function getInventory(productId?: number): InventoryRow[] {
  const db = getDb();
  if (productId !== undefined) {
    return db
      .prepare("SELECT * FROM inventory WHERE product_id = ?")
      .all(productId) as InventoryRow[];
  }
  return db.prepare("SELECT * FROM inventory").all() as InventoryRow[];
}

/**
 * Insert or update an inventory row. If `id` is provided and exists, update;
 * otherwise insert a new row.
 */
export function upsertInventory(
  row: Omit<InventoryRow, "id"> & { id?: number }
): number {
  const db = getDb();

  if (row.id) {
    db.prepare(`
      UPDATE inventory SET
        product_id = @product_id,
        quantity_on_hand = @quantity_on_hand,
        unit_measure = @unit_measure,
        lot_number = @lot_number,
        expiry_date = @expiry_date,
        purchase_date = @purchase_date,
        purchase_price = @purchase_price,
        supplier = @supplier,
        storage_location = @storage_location,
        notes = @notes
      WHERE id = @id
    `).run({
      id: row.id,
      product_id: row.product_id,
      quantity_on_hand: row.quantity_on_hand,
      unit_measure: row.unit_measure ?? null,
      lot_number: row.lot_number ?? null,
      expiry_date: row.expiry_date ?? null,
      purchase_date: row.purchase_date ?? null,
      purchase_price: row.purchase_price ?? null,
      supplier: row.supplier ?? null,
      storage_location: row.storage_location ?? null,
      notes: row.notes ?? null,
    });
    return row.id;
  }

  const result = db.prepare(`
    INSERT INTO inventory (
      product_id, quantity_on_hand, unit_measure, lot_number,
      expiry_date, purchase_date, purchase_price, supplier,
      storage_location, notes
    ) VALUES (
      @product_id, @quantity_on_hand, @unit_measure, @lot_number,
      @expiry_date, @purchase_date, @purchase_price, @supplier,
      @storage_location, @notes
    )
  `).run({
    product_id: row.product_id,
    quantity_on_hand: row.quantity_on_hand,
    unit_measure: row.unit_measure ?? null,
    lot_number: row.lot_number ?? null,
    expiry_date: row.expiry_date ?? null,
    purchase_date: row.purchase_date ?? null,
    purchase_price: row.purchase_price ?? null,
    supplier: row.supplier ?? null,
    storage_location: row.storage_location ?? null,
    notes: row.notes ?? null,
  });

  return Number(result.lastInsertRowid);
}

/**
 * Deduct a quantity from the inventory for a given product.
 * Deducts from the oldest inventory rows first (FIFO by purchase_date).
 * Throws if there is insufficient inventory.
 */
export function deductInventory(productId: number, quantity: number): void {
  const db = getDb();

  db.transaction(() => {
    const rows = db
      .prepare(
        `SELECT id, quantity_on_hand FROM inventory
         WHERE product_id = ? AND quantity_on_hand > 0
         ORDER BY purchase_date ASC, id ASC`
      )
      .all(productId) as Array<{ id: number; quantity_on_hand: number }>;

    let remaining = quantity;

    for (const row of rows) {
      if (remaining <= 0) break;

      if (row.quantity_on_hand <= remaining) {
        // Use this entire lot
        db.prepare("UPDATE inventory SET quantity_on_hand = 0 WHERE id = ?").run(
          row.id
        );
        remaining -= row.quantity_on_hand;
      } else {
        // Partial deduction
        db.prepare(
          "UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?"
        ).run(remaining, row.id);
        remaining = 0;
      }
    }

    if (remaining > 0) {
      throw new Error(
        `Insufficient inventory for product ${productId}: needed ${quantity}, short by ${remaining}`
      );
    }
  })();
}

/**
 * Get workers for a given orchard.
 */
export function getWorkers(orchardId: number): WorkerRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM workers WHERE orchard_id = ? AND active = 1 ORDER BY name")
    .all(orchardId) as WorkerRow[];
}

/**
 * Get scab infection log entries for an orchard, optionally filtered to a
 * specific season year (e.g. 2026 returns all entries from 2026-01-01 to
 * 2026-12-31).
 */
export function getScabInfectionLog(
  orchardId: number,
  season?: number
): ScabInfectionLogRow[] {
  const db = getDb();

  if (season !== undefined) {
    return db
      .prepare(
        `SELECT * FROM scab_infection_log
         WHERE orchard_id = ?
           AND date >= ? AND date <= ?
         ORDER BY date`
      )
      .all(orchardId, `${season}-01-01`, `${season}-12-31`) as ScabInfectionLogRow[];
  }

  return db
    .prepare("SELECT * FROM scab_infection_log WHERE orchard_id = ? ORDER BY date")
    .all(orchardId) as ScabInfectionLogRow[];
}

/**
 * Log a scab infection event. Returns the new row id.
 */
export function logScabInfection(
  row: Omit<ScabInfectionLogRow, "id">
): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO scab_infection_log (
      orchard_id, date, severity, mean_temp, wetness_hours,
      protected, fungicide_used, notes
    ) VALUES (
      @orchard_id, @date, @severity, @mean_temp, @wetness_hours,
      @protected, @fungicide_used, @notes
    )
  `).run({
    orchard_id: row.orchard_id,
    date: row.date,
    severity: row.severity,
    mean_temp: row.mean_temp ?? null,
    wetness_hours: row.wetness_hours ?? null,
    protected: row.protected ?? 0,
    fungicide_used: row.fungicide_used ?? null,
    notes: row.notes ?? null,
  });

  return Number(result.lastInsertRowid);
}

/**
 * Get saved tank mix templates for an orchard.
 */
export function getTankMixTemplates(orchardId: number): TankMixTemplateRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM tank_mix_templates WHERE orchard_id = ? ORDER BY name")
    .all(orchardId) as TankMixTemplateRow[];
}

/**
 * Save a tank mix template. If `id` is provided and exists, update;
 * otherwise insert a new row. Returns the row id.
 */
export function saveTankMixTemplate(
  template: Omit<TankMixTemplateRow, "id" | "created_at"> & { id?: number }
): number {
  const db = getDb();

  if (template.id) {
    db.prepare(`
      UPDATE tank_mix_templates SET
        orchard_id = @orchard_id,
        name = @name,
        products = @products,
        tank_size_l = @tank_size_l,
        area_ha = @area_ha,
        notes = @notes
      WHERE id = @id
    `).run({
      id: template.id,
      orchard_id: template.orchard_id,
      name: template.name,
      products: template.products,
      tank_size_l: template.tank_size_l ?? null,
      area_ha: template.area_ha ?? null,
      notes: template.notes ?? null,
    });
    return template.id;
  }

  const result = db.prepare(`
    INSERT INTO tank_mix_templates (
      orchard_id, name, products, tank_size_l, area_ha, notes
    ) VALUES (
      @orchard_id, @name, @products, @tank_size_l, @area_ha, @notes
    )
  `).run({
    orchard_id: template.orchard_id,
    name: template.name,
    products: template.products,
    tank_size_l: template.tank_size_l ?? null,
    area_ha: template.area_ha ?? null,
    notes: template.notes ?? null,
  });

  return Number(result.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Alert Preferences helpers
// ---------------------------------------------------------------------------

export interface AlertPrefsRow {
  id: number;
  orchard_id: number;
  email: string | null;
  phone: string | null;
  urgent_enabled: number;
  warning_enabled: number;
  preparation_enabled: number;
  quiet_start: number;
  quiet_end: number;
  channel: "email" | "sms" | "both";
}

/**
 * Ensure the alert_prefs table exists.
 */
function ensureAlertPrefsTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_prefs (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      orchard_id          INTEGER REFERENCES orchards(id),
      email               TEXT,
      phone               TEXT,
      urgent_enabled      INTEGER DEFAULT 1,
      warning_enabled     INTEGER DEFAULT 1,
      preparation_enabled INTEGER DEFAULT 1,
      quiet_start         INTEGER DEFAULT 22,
      quiet_end           INTEGER DEFAULT 5,
      channel             TEXT DEFAULT 'email' CHECK(channel IN ('email','sms','both')),
      UNIQUE(orchard_id)
    )
  `);
}

export function getAlertPrefs(orchardId: number): AlertPrefsRow | undefined {
  ensureAlertPrefsTable();
  const db = getDb();
  return db
    .prepare("SELECT * FROM alert_prefs WHERE orchard_id = ?")
    .get(orchardId) as AlertPrefsRow | undefined;
}

export function upsertAlertPrefs(prefs: Omit<AlertPrefsRow, "id">): void {
  ensureAlertPrefsTable();
  const db = getDb();
  db.prepare(`
    INSERT INTO alert_prefs (
      orchard_id, email, phone, urgent_enabled, warning_enabled,
      preparation_enabled, quiet_start, quiet_end, channel
    ) VALUES (
      @orchard_id, @email, @phone, @urgent_enabled, @warning_enabled,
      @preparation_enabled, @quiet_start, @quiet_end, @channel
    )
    ON CONFLICT(orchard_id) DO UPDATE SET
      email = excluded.email,
      phone = excluded.phone,
      urgent_enabled = excluded.urgent_enabled,
      warning_enabled = excluded.warning_enabled,
      preparation_enabled = excluded.preparation_enabled,
      quiet_start = excluded.quiet_start,
      quiet_end = excluded.quiet_end,
      channel = excluded.channel
  `).run({
    orchard_id: prefs.orchard_id,
    email: prefs.email ?? null,
    phone: prefs.phone ?? null,
    urgent_enabled: prefs.urgent_enabled,
    warning_enabled: prefs.warning_enabled,
    preparation_enabled: prefs.preparation_enabled,
    quiet_start: prefs.quiet_start,
    quiet_end: prefs.quiet_end,
    channel: prefs.channel,
  });
}

export function getAlertLog(orchardId: number, limit: number = 50): AlertLogRow[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM alert_log WHERE orchard_id = ? ORDER BY sent_at DESC LIMIT ?"
    )
    .all(orchardId, limit) as AlertLogRow[];
}

// ---------------------------------------------------------------------------
// Irrigation helpers
// ---------------------------------------------------------------------------

import type { IrrigationConfig, WaterBalanceRow, IrrigationLogEntry } from "./irrigation/types";

export function getIrrigationConfig(orchardId: number = 1): IrrigationConfig | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM irrigation_config WHERE orchard_id = ?")
    .get(orchardId) as IrrigationConfig | undefined;
  return row ?? null;
}

export function upsertIrrigationConfig(config: Omit<IrrigationConfig, "id">): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO irrigation_config (
      orchard_id, enabled, soil_type, root_depth_cm, field_capacity_mm,
      wilting_point_mm, available_water_mm, management_allowable_depletion,
      irrigation_type, irrigation_rate_mm_per_hour, irrigation_system_specs,
      water_cost_per_m3, block_area_ha, notes
    ) VALUES (
      @orchard_id, @enabled, @soil_type, @root_depth_cm, @field_capacity_mm,
      @wilting_point_mm, @available_water_mm, @management_allowable_depletion,
      @irrigation_type, @irrigation_rate_mm_per_hour, @irrigation_system_specs,
      @water_cost_per_m3, @block_area_ha, @notes
    )
    ON CONFLICT(orchard_id) DO UPDATE SET
      enabled = excluded.enabled,
      soil_type = excluded.soil_type,
      root_depth_cm = excluded.root_depth_cm,
      field_capacity_mm = excluded.field_capacity_mm,
      wilting_point_mm = excluded.wilting_point_mm,
      available_water_mm = excluded.available_water_mm,
      management_allowable_depletion = excluded.management_allowable_depletion,
      irrigation_type = excluded.irrigation_type,
      irrigation_rate_mm_per_hour = excluded.irrigation_rate_mm_per_hour,
      irrigation_system_specs = excluded.irrigation_system_specs,
      water_cost_per_m3 = excluded.water_cost_per_m3,
      block_area_ha = excluded.block_area_ha,
      notes = excluded.notes
  `).run({
    orchard_id: config.orchard_id,
    enabled: config.enabled,
    soil_type: config.soil_type,
    root_depth_cm: config.root_depth_cm,
    field_capacity_mm: config.field_capacity_mm,
    wilting_point_mm: config.wilting_point_mm,
    available_water_mm: config.available_water_mm,
    management_allowable_depletion: config.management_allowable_depletion,
    irrigation_type: config.irrigation_type,
    irrigation_rate_mm_per_hour: config.irrigation_rate_mm_per_hour,
    irrigation_system_specs: config.irrigation_system_specs ?? null,
    water_cost_per_m3: config.water_cost_per_m3,
    block_area_ha: config.block_area_ha,
    notes: config.notes ?? null,
  });
}

export function getWaterBalance(
  orchardId: number,
  startDate: string,
  endDate: string,
): WaterBalanceRow[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM water_balance WHERE orchard_id = ? AND date >= ? AND date <= ? ORDER BY date"
    )
    .all(orchardId, startDate, endDate) as WaterBalanceRow[];
}

export function upsertWaterBalance(row: Omit<WaterBalanceRow, "id" | "created_at">): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO water_balance (
      orchard_id, date, rainfall_mm, effective_rainfall_mm, irrigation_mm,
      et_reference_mm, crop_coefficient, et_crop_mm, soil_water_mm,
      depletion_mm, depletion_pct, deep_drainage_mm, status
    ) VALUES (
      @orchard_id, @date, @rainfall_mm, @effective_rainfall_mm, @irrigation_mm,
      @et_reference_mm, @crop_coefficient, @et_crop_mm, @soil_water_mm,
      @depletion_mm, @depletion_pct, @deep_drainage_mm, @status
    )
    ON CONFLICT(orchard_id, date) DO UPDATE SET
      rainfall_mm = excluded.rainfall_mm,
      effective_rainfall_mm = excluded.effective_rainfall_mm,
      irrigation_mm = excluded.irrigation_mm,
      et_reference_mm = excluded.et_reference_mm,
      crop_coefficient = excluded.crop_coefficient,
      et_crop_mm = excluded.et_crop_mm,
      soil_water_mm = excluded.soil_water_mm,
      depletion_mm = excluded.depletion_mm,
      depletion_pct = excluded.depletion_pct,
      deep_drainage_mm = excluded.deep_drainage_mm,
      status = excluded.status
  `).run({
    orchard_id: row.orchard_id,
    date: row.date,
    rainfall_mm: row.rainfall_mm,
    effective_rainfall_mm: row.effective_rainfall_mm,
    irrigation_mm: row.irrigation_mm,
    et_reference_mm: row.et_reference_mm,
    crop_coefficient: row.crop_coefficient,
    et_crop_mm: row.et_crop_mm,
    soil_water_mm: row.soil_water_mm,
    depletion_mm: row.depletion_mm,
    depletion_pct: row.depletion_pct,
    deep_drainage_mm: row.deep_drainage_mm,
    status: row.status,
  });
}

export function getIrrigationLog(
  orchardId: number,
  startDate?: string,
  endDate?: string,
): IrrigationLogEntry[] {
  const db = getDb();
  if (startDate && endDate) {
    return db
      .prepare(
        "SELECT * FROM irrigation_log WHERE orchard_id = ? AND date >= ? AND date <= ? ORDER BY date DESC"
      )
      .all(orchardId, startDate, endDate) as IrrigationLogEntry[];
  }
  return db
    .prepare(
      "SELECT * FROM irrigation_log WHERE orchard_id = ? ORDER BY date DESC LIMIT 50"
    )
    .all(orchardId) as IrrigationLogEntry[];
}

export function insertIrrigationLog(
  row: Omit<IrrigationLogEntry, "id" | "created_at">,
): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO irrigation_log (
      orchard_id, date, start_time, end_time, duration_hours,
      amount_mm, source, water_volume_m3, cost, notes
    ) VALUES (
      @orchard_id, @date, @start_time, @end_time, @duration_hours,
      @amount_mm, @source, @water_volume_m3, @cost, @notes
    )
  `).run({
    orchard_id: row.orchard_id,
    date: row.date,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
    duration_hours: row.duration_hours,
    amount_mm: row.amount_mm,
    source: row.source,
    water_volume_m3: row.water_volume_m3,
    cost: row.cost,
    notes: row.notes ?? null,
  });
  return Number(result.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Helper functions — planted blocks
// ---------------------------------------------------------------------------

export function getPlantedBlocks(orchardId: number): PlantedBlockRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM planted_blocks WHERE orchard_id = ? ORDER BY block_name")
    .all(orchardId) as PlantedBlockRow[];
}

export function getPlantedBlock(id: number, orchardId: number = 1): PlantedBlockRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM planted_blocks WHERE id = ? AND orchard_id = ?")
    .get(id, orchardId) as PlantedBlockRow | undefined;
}

export function insertPlantedBlock(
  block: Omit<PlantedBlockRow, "id" | "created_at">,
): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO planted_blocks (
      orchard_id, block_name, variety, rootstock,
      planted_year, tree_count, spacing_in_row_m,
      spacing_between_rows_m, area_ha, notes
    ) VALUES (
      @orchard_id, @block_name, @variety, @rootstock,
      @planted_year, @tree_count, @spacing_in_row_m,
      @spacing_between_rows_m, @area_ha, @notes
    )
  `).run({
    orchard_id: block.orchard_id,
    block_name: block.block_name,
    variety: block.variety,
    rootstock: block.rootstock ?? null,
    planted_year: block.planted_year ?? null,
    tree_count: block.tree_count ?? null,
    spacing_in_row_m: block.spacing_in_row_m ?? null,
    spacing_between_rows_m: block.spacing_between_rows_m ?? null,
    area_ha: block.area_ha ?? null,
    notes: block.notes ?? null,
  });
  return Number(result.lastInsertRowid);
}

export function updatePlantedBlock(
  block: PlantedBlockRow,
): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE planted_blocks SET
      block_name = @block_name,
      variety = @variety,
      rootstock = @rootstock,
      planted_year = @planted_year,
      tree_count = @tree_count,
      spacing_in_row_m = @spacing_in_row_m,
      spacing_between_rows_m = @spacing_between_rows_m,
      area_ha = @area_ha,
      notes = @notes
    WHERE id = @id AND orchard_id = @orchard_id
  `).run({
    id: block.id,
    orchard_id: block.orchard_id,
    block_name: block.block_name,
    variety: block.variety,
    rootstock: block.rootstock ?? null,
    planted_year: block.planted_year ?? null,
    tree_count: block.tree_count ?? null,
    spacing_in_row_m: block.spacing_in_row_m ?? null,
    spacing_between_rows_m: block.spacing_between_rows_m ?? null,
    area_ha: block.area_ha ?? null,
    notes: block.notes ?? null,
  });
  return result.changes > 0;
}

export function deletePlantedBlock(id: number, orchardId: number = 1): boolean {
  const db = getDb();
  const result = db.prepare(
    "DELETE FROM planted_blocks WHERE id = ? AND orchard_id = ?"
  ).run(id, orchardId);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Helper functions — orchard blocks + block plantings
// ---------------------------------------------------------------------------

export function getOrchardBlocks(orchardId: number): OrchardBlockWithPlantings[] {
  const db = getDb();
  const blocks = db
    .prepare("SELECT * FROM orchard_blocks WHERE orchard_id = ? ORDER BY block_name")
    .all(orchardId) as OrchardBlockRow[];

  return blocks.map((block) => ({
    ...block,
    plantings: db
      .prepare("SELECT * FROM block_plantings WHERE block_id = ? ORDER BY id")
      .all(block.id) as BlockPlantingRow[],
  }));
}

export function getOrchardBlock(id: number, orchardId: number = 1): OrchardBlockWithPlantings | undefined {
  const db = getDb();
  const block = db
    .prepare("SELECT * FROM orchard_blocks WHERE id = ? AND orchard_id = ?")
    .get(id, orchardId) as OrchardBlockRow | undefined;
  if (!block) return undefined;
  return {
    ...block,
    plantings: db
      .prepare("SELECT * FROM block_plantings WHERE block_id = ? ORDER BY id")
      .all(block.id) as BlockPlantingRow[],
  };
}

export function insertOrchardBlock(
  block: Omit<OrchardBlockRow, "id" | "created_at">,
): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO orchard_blocks (
      orchard_id, block_name, total_area_ha, year_established,
      soil_type, irrigation_system, notes
    ) VALUES (
      @orchard_id, @block_name, @total_area_ha, @year_established,
      @soil_type, @irrigation_system, @notes
    )
  `).run({
    orchard_id: block.orchard_id,
    block_name: block.block_name,
    total_area_ha: block.total_area_ha ?? null,
    year_established: block.year_established ?? null,
    soil_type: block.soil_type ?? null,
    irrigation_system: block.irrigation_system ?? null,
    notes: block.notes ?? null,
  });
  return Number(result.lastInsertRowid);
}

export function updateOrchardBlock(
  block: OrchardBlockRow,
): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE orchard_blocks SET
      block_name = @block_name,
      total_area_ha = @total_area_ha,
      year_established = @year_established,
      soil_type = @soil_type,
      irrigation_system = @irrigation_system,
      notes = @notes
    WHERE id = @id AND orchard_id = @orchard_id
  `).run({
    id: block.id,
    orchard_id: block.orchard_id,
    block_name: block.block_name,
    total_area_ha: block.total_area_ha ?? null,
    year_established: block.year_established ?? null,
    soil_type: block.soil_type ?? null,
    irrigation_system: block.irrigation_system ?? null,
    notes: block.notes ?? null,
  });
  return result.changes > 0;
}

export function deleteOrchardBlock(id: number, orchardId: number = 1): boolean {
  const db = getDb();
  const result = db.prepare(
    "DELETE FROM orchard_blocks WHERE id = ? AND orchard_id = ?"
  ).run(id, orchardId);
  return result.changes > 0;
}

export function insertBlockPlanting(
  planting: Omit<BlockPlantingRow, "id" | "created_at">,
): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO block_plantings (
      block_id, variety, rootstock, tree_count,
      spacing_in_row_m, spacing_between_rows_m,
      rows_description, planted_year, sub_notes
    ) VALUES (
      @block_id, @variety, @rootstock, @tree_count,
      @spacing_in_row_m, @spacing_between_rows_m,
      @rows_description, @planted_year, @sub_notes
    )
  `).run({
    block_id: planting.block_id,
    variety: planting.variety,
    rootstock: planting.rootstock ?? null,
    tree_count: planting.tree_count ?? null,
    spacing_in_row_m: planting.spacing_in_row_m ?? null,
    spacing_between_rows_m: planting.spacing_between_rows_m ?? null,
    rows_description: planting.rows_description ?? null,
    planted_year: planting.planted_year ?? null,
    sub_notes: planting.sub_notes ?? null,
  });
  return Number(result.lastInsertRowid);
}

export function getBlockPlanting(id: number): BlockPlantingRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM block_plantings WHERE id = ?")
    .get(id) as BlockPlantingRow | undefined;
}

export function updateBlockPlanting(
  planting: BlockPlantingRow,
): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE block_plantings SET
      variety = @variety,
      rootstock = @rootstock,
      tree_count = @tree_count,
      spacing_in_row_m = @spacing_in_row_m,
      spacing_between_rows_m = @spacing_between_rows_m,
      rows_description = @rows_description,
      planted_year = @planted_year,
      sub_notes = @sub_notes
    WHERE id = @id AND block_id = @block_id
  `).run({
    id: planting.id,
    block_id: planting.block_id,
    variety: planting.variety,
    rootstock: planting.rootstock ?? null,
    tree_count: planting.tree_count ?? null,
    spacing_in_row_m: planting.spacing_in_row_m ?? null,
    spacing_between_rows_m: planting.spacing_between_rows_m ?? null,
    rows_description: planting.rows_description ?? null,
    planted_year: planting.planted_year ?? null,
    sub_notes: planting.sub_notes ?? null,
  });
  return result.changes > 0;
}

export function deleteBlockPlanting(id: number): boolean {
  const db = getDb();
  const result = db.prepare(
    "DELETE FROM block_plantings WHERE id = ?"
  ).run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Model cache — offline resilience
// ---------------------------------------------------------------------------

export interface ModelCacheRow {
  id: number;
  orchard_id: number;
  cache_key: string;
  result_json: string;
  cached_at: string;
}

/**
 * Cache model results for offline resilience. Uses UPSERT to always keep
 * the latest result.
 */
export function cacheModelResults(
  orchardId: number,
  results: unknown,
  cacheKey: string = "all_models",
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO model_cache (orchard_id, cache_key, result_json, cached_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(orchard_id, cache_key) DO UPDATE SET
      result_json = excluded.result_json,
      cached_at = excluded.cached_at
  `).run(orchardId, cacheKey, JSON.stringify(results));
}

/**
 * Retrieve cached model results. Returns null if no cache exists.
 */
export function getCachedModelResults(
  orchardId: number,
  cacheKey: string = "all_models",
): { results: unknown; cachedAt: string } | null {
  const db = getDb();
  const row = db
    .prepare("SELECT result_json, cached_at FROM model_cache WHERE orchard_id = ? AND cache_key = ?")
    .get(orchardId, cacheKey) as { result_json: string; cached_at: string } | undefined;

  if (!row) return null;

  try {
    return { results: JSON.parse(row.result_json), cachedAt: row.cached_at };
  } catch {
    return null;
  }
}
