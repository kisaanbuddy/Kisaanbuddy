/**
 * KrishiAI — Satellite Intelligence Client API
 * 
 * Fetches real Copernicus Sentinel-2 multispectral and Sentinel-1 SAR observations,
 * dynamic raster tiles (RGB, NDVI, NDWI, EVI, Radar), and geodesic farm polygon areas.
 * Adheres strictly to the Reality First Policy (AGENTS.md).
 */

export interface SatelliteIndexMeta {
  formula: string
  bands: string
  value: number
  min?: number
  max?: number
  interpretation: string
}

export interface SatelliteIndices {
  ndvi: SatelliteIndexMeta
  ndwi: SatelliteIndexMeta
  evi: SatelliteIndexMeta
}

export interface SatelliteFieldStats {
  mean_ndvi: number
  min_ndvi: number
  max_ndvi: number
  mean_ndwi: number
  mean_evi: number
  spatial_variation_pct: number
  health_status: string
  health_color: 'emerald' | 'lime' | 'amber' | 'rose'
  stress_risk: string
  valid_pixels_pct: number
}

export interface SatelliteObservation {
  scene_id: string
  acquisition_date: string
  acquisition_datetime: string
  satellite: string
  cloud_cover_pct: number
  is_cloud_contaminated: boolean
  cloud_warning?: string
  tile_urls: {
    visual: string
    ndvi: string
    ndwi: string
    evi: string
  }
  indices: SatelliteIndices
  field_stats: SatelliteFieldStats
}

export interface RadarObservation {
  scene_id: string
  acquisition_date: string
  satellite: string
  instrument: string
  polarizations: string[]
  tile_url_vv: string
  interpretation: string
}

export interface HistoricalTimelineItem {
  date: string
  mean_ndvi: number
  mean_ndwi: number
  cloud_cover_pct: number
  scene_id: string
  stage_estimate: string
}

export interface SatelliteIntelligenceResponse {
  status: 'success' | 'partial' | 'error'
  has_custom_boundary: boolean
  calculated_acres: number
  bounding_box: [number, number, number, number]
  center: [number, number]
  current_observation: SatelliteObservation
  radar_observation: RadarObservation | null
  historical_timeline: HistoricalTimelineItem[]
  agronomic_interpretation: string[]
}

export interface PolygonAreaResult {
  acres: number
  hectares: number
  bighas_standard: number
  vertices_count: number
}

/**
 * Fetch field-level satellite intelligence for coordinates and optional farm boundary
 */
export async function fetchFieldSatelliteIntelligence(params: {
  lat: number
  lon: number
  polygonCoordinates?: [number, number][] // [[lon, lat], ...]
  soilType?: string
  cropName?: string
}): Promise<SatelliteIntelligenceResponse> {
  const res = await fetch('/api/satellite/field-intelligence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: params.lat,
      lon: params.lon,
      polygon_coordinates: params.polygonCoordinates || null,
      soil_type: params.soilType || 'loamy',
      crop_name: params.cropName || null,
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to fetch satellite intelligence (${res.status}): ${errorText}`)
  }

  return res.json()
}

/**
 * Calculate geodesic polygon area in acres, hectares, and bighas
 */
export async function calculatePolygonAreaApi(
  coordinates: [number, number][]
): Promise<PolygonAreaResult> {
  const res = await fetch('/api/satellite/calculate-area', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to calculate polygon area (${res.status}): ${errorText}`)
  }

  return res.json()
}
