"use client"

import React, { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import {
  Satellite,
  Layers,
  MapPin,
  Pencil,
  RotateCcw,
  Upload,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  Eye,
  Radio,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  SatelliteObservation,
  RadarObservation,
  PolygonAreaResult,
} from "@/lib/satellite-api"

interface SatelliteFarmMapProps {
  lat: number
  lon: number
  polygonCoordinates: [number, number][] // [[lon, lat], ...]
  onPolygonChange: (coords: [number, number][]) => void
  onAreaCalculated?: (area: PolygonAreaResult) => void
  observation: SatelliteObservation | null
  radarObservation: RadarObservation | null
  loading?: boolean
}

type LayerMode = "base" | "visual" | "ndvi" | "ndwi" | "evi" | "radar"

export default function SatelliteFarmMap({
  lat,
  lon,
  polygonCoordinates,
  onPolygonChange,
  onAreaCalculated,
  observation,
  radarObservation,
  loading = false,
}: SatelliteFarmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const polygonLayerRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const overlayTileLayerRef = useRef<any>(null)

  const [activeLayer, setActiveLayer] = useState<LayerMode>("base")
  const [isDrawing, setIsDrawing] = useState(false)
  const [tempPoints, setTempPoints] = useState<[number, number][]>([])
  const [areaInfo, setAreaInfo] = useState<PolygonAreaResult | null>(null)
  const [calculatingArea, setCalculatingArea] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true
    let L: any = null

    async function initMap() {
      if (!mapContainerRef.current) return
      L = await import("leaflet")

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      })

      // ESRI World Imagery Base (Real satellite base)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri, Maxar, Earthstar Geographics",
        }
      ).addTo(map)

      // Add OpenStreetMap Carto Labels for context
      L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          opacity: 0.8,
        }
      ).addTo(map)

      mapInstanceRef.current = map

      // Click handler for polygon boundary drawing
      map.on("click", (e: any) => {
        if (!isDrawing) return
        const newPoint: [number, number] = [e.latlng.lng, e.latlng.lat] // GeoJSON [lon, lat]
        setTempPoints((prev) => [...prev, newPoint])
      })
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lon])

  // Update center when lat/lon changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], mapInstanceRef.current.getZoom() || 15)
    }
  }, [lat, lon])

  // Handle active overlay raster tile layers (Sentinel-2 Visual, NDVI, NDWI, EVI, Sentinel-1 Radar)
  useEffect(() => {
    async function updateOverlay() {
      if (!mapInstanceRef.current) return
      const L = await import("leaflet")

      // Remove existing overlay
      if (overlayTileLayerRef.current) {
        mapInstanceRef.current.removeLayer(overlayTileLayerRef.current)
        overlayTileLayerRef.current = null
      }

      if (activeLayer === "base") return

      let tileUrl: string | null = null

      if (observation?.tile_urls) {
        if (activeLayer === "visual") tileUrl = observation.tile_urls.visual
        else if (activeLayer === "ndvi") tileUrl = observation.tile_urls.ndvi
        else if (activeLayer === "ndwi") tileUrl = observation.tile_urls.ndwi
        else if (activeLayer === "evi") tileUrl = observation.tile_urls.evi
      }

      if (activeLayer === "radar" && radarObservation?.tile_url_vv) {
        tileUrl = radarObservation.tile_url_vv
      }

      if (tileUrl) {
        const overlay = L.tileLayer(tileUrl, {
          maxZoom: 19,
          opacity: activeLayer === "visual" ? 0.95 : 0.78,
        })
        overlay.addTo(mapInstanceRef.current)
        overlayTileLayerRef.current = overlay
      }
    }

    updateOverlay()
  }, [activeLayer, observation, radarObservation])

  // Synchronize polygon rendering on the map
  useEffect(() => {
    async function renderPolygon() {
      if (!mapInstanceRef.current) return
      const L = await import("leaflet")

      // Clear existing boundary layers
      if (polygonLayerRef.current) {
        mapInstanceRef.current.removeLayer(polygonLayerRef.current)
        polygonLayerRef.current = null
      }
      if (markersLayerRef.current) {
        mapInstanceRef.current.removeLayer(markersLayerRef.current)
        markersLayerRef.current = null
      }

      const activeCoords = isDrawing ? tempPoints : polygonCoordinates

      if (activeCoords.length === 0) {
        // Add a single center marker if no polygon
        const marker = L.circleMarker([lat, lon], {
          radius: 8,
          color: "#10b981",
          fillColor: "#059669",
          fillOpacity: 0.9,
          weight: 2,
        })
        marker.bindPopup("<b>Farm Center Location</b><br/>Draw a boundary to analyze exact field pixels.")
        marker.addTo(mapInstanceRef.current)
        markersLayerRef.current = marker
        return
      }

      // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
      const leafletPoints: [number, number][] = activeCoords.map((pt) => [pt[1], pt[0]])

      const poly = L.polygon(leafletPoints as any, {
        color: isDrawing ? "#3b82f6" : "#10b981",
        fillColor: isDrawing ? "#60a5fa" : "#34d399",
        fillOpacity: 0.35,
        weight: 3,
        dashArray: isDrawing ? "6, 6" : undefined,
      })

      poly.addTo(mapInstanceRef.current)
      polygonLayerRef.current = poly

      // Vertex markers
      const markerGroup = L.layerGroup()
      leafletPoints.forEach((pt: [number, number], index: number) => {
        const dot = L.circleMarker(pt, {
          radius: 5,
          color: "#ffffff",
          fillColor: isDrawing ? "#2563eb" : "#059669",
          fillOpacity: 1,
          weight: 2,
        })
        dot.bindTooltip(`Vertex ${index + 1}`, { permanent: false, direction: "top" })
        markerGroup.addLayer(dot)
      })

      markerGroup.addTo(mapInstanceRef.current)
      markersLayerRef.current = markerGroup

      // Fit bounds if polygon has at least 3 points and not in mid-drawing
      if (!isDrawing && leafletPoints.length >= 3) {
        mapInstanceRef.current.fitBounds(poly.getBounds(), { padding: [30, 30], maxZoom: 17 })
      }
    }

    renderPolygon()
  }, [polygonCoordinates, tempPoints, isDrawing, lat, lon])

  // Area calculation when polygon updates
  useEffect(() => {
    async function updateArea() {
      if (polygonCoordinates.length < 3) {
        setAreaInfo(null)
        return
      }
      setCalculatingArea(true)
      try {
        const { calculatePolygonAreaApi } = await import("@/lib/satellite-api")
        const res = await calculatePolygonAreaApi(polygonCoordinates)
        setAreaInfo(res)
        onAreaCalculated?.(res)
      } catch (e) {
        console.error("Area calculation error", e)
      } finally {
        setCalculatingArea(false)
      }
    }

    updateArea()
  }, [polygonCoordinates])

  // Handlers for Drawing
  const handleStartDrawing = () => {
    setIsDrawing(true)
    setTempPoints([])
  }

  const handleFinishDrawing = () => {
    if (tempPoints.length >= 3) {
      onPolygonChange(tempPoints)
    }
    setIsDrawing(false)
    setTempPoints([])
  }

  const handleCancelDrawing = () => {
    setIsDrawing(false)
    setTempPoints([])
  }

  const handleClearBoundary = () => {
    onPolygonChange([])
    setTempPoints([])
    setAreaInfo(null)
  }

  // GeoJSON file upload
  const handleGeoJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        let coords: [number, number][] = []

        if (json.type === "FeatureCollection" && json.features?.[0]?.geometry?.coordinates) {
          coords = json.features[0].geometry.coordinates[0]
        } else if (json.type === "Feature" && json.geometry?.coordinates) {
          coords = json.geometry.coordinates[0]
        } else if (json.type === "Polygon" && json.coordinates) {
          coords = json.coordinates[0]
        }

        if (Array.isArray(coords) && coords.length >= 3) {
          // Normalize to [lon, lat]
          const validCoords: [number, number][] = coords
            .map((pt: any) => [Number(pt[0]), Number(pt[1])] as [number, number])
            .filter((pt) => !isNaN(pt[0]) && !isNaN(pt[1]))

          onPolygonChange(validCoords)
        } else {
          setFileError("Invalid GeoJSON polygon. Could not locate polygon ring coordinates.")
        }
      } catch {
        setFileError("Could not parse GeoJSON file. Please check file format.")
      }
    }
    reader.readAsText(file)
  }

  // GeoJSON export
  const handleExportGeoJSON = () => {
    if (polygonCoordinates.length < 3) return
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            source: "KisaanBuddy Precision Agriculture",
            acres: areaInfo?.acres,
            hectares: areaInfo?.hectares,
          },
          geometry: {
            type: "Polygon",
            coordinates: [[...polygonCoordinates, polygonCoordinates[0]]],
          },
        },
      ],
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kisaanbuddy_field_boundary_${Date.now()}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Satellite className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">Interactive Satellite Farm Map</h3>
          {observation && (
            <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs bg-emerald-50 text-emerald-800 border-emerald-300">{observation.satellite} &bull; {observation.acquisition_date}</span>
          )}
        </div>

        {/* Layer Mode Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setActiveLayer("base")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
              activeLayer === "base"
                ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            Base Satellite
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("visual")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
              activeLayer === "visual"
                ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            True Color (S2)
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("ndvi")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
              activeLayer === "ndvi"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            NDVI (Vigor)
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("ndwi")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
              activeLayer === "ndwi"
                ? "bg-blue-700 text-white border-blue-700 shadow-2xs"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            NDWI (Water)
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("evi")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
              activeLayer === "evi"
                ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            EVI (Biomass)
          </button>
          {radarObservation && (
            <button
              type="button"
              onClick={() => setActiveLayer("radar")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
                activeLayer === "radar"
                  ? "bg-purple-800 text-white border-purple-800 shadow-2xs"
                  : "bg-background text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              Sentinel-1 SAR
            </button>
          )}
        </div>
      </div>

      {/* Cloud Contamination Banner (Reality First Policy) */}
      {observation?.is_cloud_contaminated && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <p className="font-bold">Cloud Contamination Detected ({observation.cloud_cover_pct}% scene cloud)</p>
            <p className="text-amber-800/90 dark:text-amber-300">
              {observation.cloud_warning ||
                "Showing the latest usable observation with minimal cloud cover to maintain authentic agricultural metrics."}
            </p>
          </div>
        </div>
      )}

      {/* Main Map Box */}
      <div className="relative rounded-xl border border-border overflow-hidden bg-muted/20 shadow-2xs">
        <div ref={mapContainerRef} className="w-full h-[420px] sm:h-[480px] z-0" />

        {/* Top-Right Drawing Status Overlay */}
        <div className="absolute top-3 right-3 z-1000 flex flex-col gap-2 items-end">
          {isDrawing ? (
            <div className="bg-card/95 backdrop-blur-xs border border-border p-2.5 rounded-lg shadow-md space-y-2 max-w-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
                <span>Click map to add boundary points</span>
              </div>
              <p className="text-2xs text-muted-foreground">
                Mark each corner of your farmland. Points marked: <b>{tempPoints.length}</b>. Minimum 3 points required.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleFinishDrawing}
                  disabled={tempPoints.length < 3}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-3"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Finish Field
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelDrawing}
                  className="text-xs h-7 px-2.5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-xs border border-border p-1.5 rounded-lg shadow-xs">
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartDrawing}
                className="text-xs h-7 px-2.5 bg-background hover:bg-muted font-medium"
              >
                <Pencil className="h-3 w-3 mr-1 text-emerald-700" />
                {polygonCoordinates.length > 0 ? "Redraw Boundary" : "Draw Boundary"}
              </Button>
              {polygonCoordinates.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearBoundary}
                  className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive"
                  title="Clear boundary"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Bottom-Left Live Acreage Box */}
        {areaInfo && (
          <div className="absolute bottom-3 left-3 z-1000 bg-card/95 backdrop-blur-xs border border-border p-3 rounded-xl shadow-md max-w-xs space-y-1">
            <div className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
              Calculated Geodesic Area
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
                {areaInfo.acres}
              </span>
              <span className="text-xs font-semibold text-foreground">Acres</span>
              <span className="text-2xs text-muted-foreground">
                ({areaInfo.hectares} ha &bull; {areaInfo.bighas_standard} Bigha)
              </span>
            </div>
            <p className="text-2xs text-muted-foreground">
              Computed via authentic WGS84 ellipsoidal geodesy across {areaInfo.vertices_count} boundary vertices.
            </p>
          </div>
        )}

        {/* Active Layer Legend (Bottom-Right) */}
        {activeLayer !== "base" && (
          <div className="absolute bottom-3 right-3 z-1000 bg-card/95 backdrop-blur-xs border border-border p-2.5 rounded-lg shadow-md text-2xs space-y-1.5 max-w-[200px]">
            <div className="font-bold text-foreground capitalize">
              {activeLayer === "ndvi" && "NDVI Health Scale"}
              {activeLayer === "ndwi" && "NDWI Water Index"}
              {activeLayer === "evi" && "EVI Biomass Scale"}
              {activeLayer === "visual" && "Sentinel-2 True Color"}
              {activeLayer === "radar" && "SAR Backscatter (VV)"}
            </div>
            {activeLayer === "ndvi" && (
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-linear-to-r from-red-500 via-yellow-400 to-green-600"></div>
                <div className="flex justify-between text-muted-foreground text-3xs font-mono">
                  <span>-0.1 Bare/Water</span>
                  <span>0.4 Moderate</span>
                  <span>0.9 Dense</span>
                </div>
              </div>
            )}
            {activeLayer === "ndwi" && (
              <div className="space-y-1">
                <div className="h-2 w-full rounded bg-linear-to-r from-slate-200 via-sky-400 to-blue-700"></div>
                <div className="flex justify-between text-muted-foreground text-3xs font-mono">
                  <span>-0.2 Dry</span>
                  <span>0.2 Optimal</span>
                  <span>0.6 Saturated</span>
                </div>
              </div>
            )}
            {activeLayer === "radar" && (
              <div className="text-muted-foreground leading-tight">
                Sentinel-1 C-band SAR radar penetrates clouds and monsoon cover to detect field surface roughness.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Boundary Upload & Export Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer font-medium">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload GeoJSON / KML Boundary</span>
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleGeoJSONUpload}
              className="hidden"
            />
          </label>

          {polygonCoordinates.length >= 3 && (
            <button
              type="button"
              onClick={handleExportGeoJSON}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Field GeoJSON</span>
            </button>
          )}
        </div>

        <div className="text-2xs text-muted-foreground">
          {polygonCoordinates.length >= 3 ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Field boundary mapped ({polygonCoordinates.length} vertices)
            </span>
          ) : (
            <span>Draw or upload your boundary to lock satellite resolution to your field perimeter.</span>
          )}
        </div>
      </div>

      {fileError && (
        <div className="text-xs text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  )
}
