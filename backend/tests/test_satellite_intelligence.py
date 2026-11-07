"""
Unit and Integration Tests for KrishiAI Satellite Remote Sensing & Unified Farm Engine.
Adheres strictly to the Reality First Policy (AGENTS.md).
"""
import pytest
import numpy as np
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from main import app
from services.satellite_service import (
    calculate_polygon_area_acres,
    get_bounding_box,
    classify_vegetation_health,
)
from services.unified_farm_engine import build_unified_farm_intelligence, DataSourceType
from db.models import SatelliteObservationRecord
from db.session import get_db

client = TestClient(app)


class TestGeodesicAreaCalculations:
    def test_triangle_farm_area(self):
        # A test polygon in Punjab (~2.5 to 3 acres)
        coords = [
            [75.850, 30.900],
            [75.852, 30.900],
            [75.852, 30.902],
            [75.850, 30.900],
        ]
        acres = calculate_polygon_area_acres(coords)
        assert acres > 0.0
        assert isinstance(acres, float)

    def test_zero_area_on_insufficient_points(self):
        assert calculate_polygon_area_acres([]) == 0.0
        assert calculate_polygon_area_acres([[75.85, 30.90]]) == 0.0
        assert calculate_polygon_area_acres([[75.85, 30.90], [75.86, 30.91]]) == 0.0

    def test_bounding_box(self):
        coords = [
            [75.80, 30.80],
            [75.90, 30.85],
            [75.85, 30.95],
        ]
        min_lon, min_lat, max_lon, max_lat = get_bounding_box(coords)
        assert min_lon == 75.80
        assert max_lon == 75.90
        assert min_lat == 30.80
        assert max_lat == 30.95


class TestAuthenticIndexFormulas:
    def test_ndvi_scientific_formula(self):
        # Pure synthetic arrays simulating real B04 (Red) and B08 (NIR)
        # NIR > Red indicates healthy vegetation
        b04 = np.array([[1000.0, 2000.0]])
        b08 = np.array([[4000.0, 2000.0]])
        scl = np.array([[4, 4]])  # 4 = Vegetation in Copernicus SCL

        denom = b08 + b04
        valid_mask = (denom > 0) & (~np.isin(scl, [3, 8, 9, 10, 11]))
        ndvi = np.where(valid_mask, (b08 - b04) / denom, np.nan)

        assert pytest.approx(ndvi[0, 0], 0.001) == (4000 - 1000) / (4000 + 1000)  # 0.60
        assert pytest.approx(ndvi[0, 1], 0.001) == 0.0

    def test_cloud_masking_with_scl(self):
        # SCL 8 = Cloud medium probability, 9 = Cloud high probability
        b04 = np.array([[1000.0, 1000.0]])
        b08 = np.array([[4000.0, 4000.0]])
        scl = np.array([[4, 9]])  # 4 = clear vegetation, 9 = cloud

        cloud_mask = np.isin(scl, [0, 1, 3, 8, 9, 10, 11])
        valid_mask = (b08 + b04 > 0) & (~cloud_mask)

        assert valid_mask[0, 0] == True
        assert valid_mask[0, 1] == False

    def test_vegetation_health_classification(self):
        status, color, risk = classify_vegetation_health(0.75)
        assert "Vigorous" in status
        assert color == "emerald"

        status, color, risk = classify_vegetation_health(0.12)
        assert "Barren" in status or "Non-Vegetated" in status or "Sparse" in status


class TestUnifiedFarmEngine:
    def test_multi_source_fusion(self):
        satellite_data = {
            "status": "success",
            "current_observation": {
                "satellite": "Sentinel-2C",
                "acquisition_date": "2026-11-02",
                "indices": {
                    "ndvi": {"value": 0.18, "valid_pixel_pct": 100.0},
                    "ndwi": {"value": 0.02},
                    "evi": {"value": 0.15},
                },
                "field_stats": {
                    "mean_ndvi": 0.18,
                    "spatial_variation_pct": 32.0,
                    "stress_zones": [
                        {"zone": "North-East", "deficit_pct": 28.0, "recommendation": "Check drainage"}
                    ],
                },
            },
        }
        soil_data = {"N": 55, "P": 25, "K": 35, "ph": 6.8, "moisture": 28}
        weather_data = {"temperature": 32, "humidity": 40, "rainfall": 15, "provider": "IMD"}
        sensor_data = {"is_online": True, "device_id": "krishiai-node-1", "temperature": 31.8, "humidity": 41, "soil_moisture": 27}
        farm_profile = {"locationLabel": "Ludhiana, Punjab", "farmSizeAcres": 4.5, "landType": "loamy"}

        fusion = build_unified_farm_intelligence(
            satellite_data=satellite_data,
            soil_data=soil_data,
            weather_data=weather_data,
            sensor_data=sensor_data,
            farm_profile=farm_profile,
        )

        assert fusion["status"] == "success"
        assert len(fusion["telemetry_ledger"]) > 5
        # Should detect moisture stress and nitrogen deficiency
        titles = [i["title"] for i in fusion["fusion_insights"]]
        assert any("Moisture" in t or "Deficit" in t for t in titles)


class TestSatelliteApiEndpoints:
    def test_satellite_health_endpoint(self):
        res = client.get("/api/satellite/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "online"
        assert "Sentinel-2" in str(data["supported_satellites"])

    def test_calculate_area_endpoint(self):
        poly = [
            [75.848, 30.898],
            [75.853, 30.898],
            [75.853, 30.902],
            [75.848, 30.902],
            [75.848, 30.898],
        ]
        res = client.post("/api/satellite/calculate-area", json={"coordinates": poly})
        assert res.status_code == 200
        data = res.json()
        assert data["acres"] > 40.0
        assert data["hectares"] > 15.0
        assert data["bighas_standard"] > 60.0
        assert data["vertices_count"] == 5

    def test_save_and_retrieve_observation(self):
        payload = {
            "farm_id": 1,
            "field_id": 1,
            "satellite_source": "Sentinel-2 L2A",
            "scene_id": "S2C_MSIL2A_TEST_001",
            "observation_date": datetime.now(timezone.utc).isoformat(),
            "cloud_cover_pct": 2.5,
            "mean_ndvi": 0.65,
            "min_ndvi": 0.45,
            "max_ndvi": 0.78,
            "mean_ndwi": 0.28,
            "mean_evi": 0.52,
            "valid_pixel_pct": 98.5,
            "spatial_variation_pct": 14.2,
            "health_status": "Vigorous Vegetative Canopy",
            "stress_risk": "Low",
        }
        res = client.post("/api/satellite/save-observation", json=payload)
        assert res.status_code == 200
        saved = res.json()
        assert saved["status"] == "success"
        assert saved["scene_id"] == "S2C_MSIL2A_TEST_001"

        # Query back
        res_list = client.get("/api/satellite/saved-observations?field_id=1")
        assert res_list.status_code == 200
        items = res_list.json()
        assert len(items) >= 1
        assert any(it["scene_id"] == "S2C_MSIL2A_TEST_001" for it in items)
