"""Unit tests for isolated DiseaseClassifier service module."""
import pytest
from PIL import Image
import numpy as np
from backend.services.disease_classifier import DiseaseClassifier, get_disease_classifier


@pytest.fixture
def classifier():
    return DiseaseClassifier()


def test_classifier_initialization(classifier):
    """Verifies taxonomy loading and class mapping."""
    assert len(classifier.classes) == 15
    assert "rice_blast" in classifier.classes
    assert "healthy_general" in classifier.classes
    assert classifier.label_mapping["rice_blast"]["crop"] == "Rice"


def test_preprocessing(classifier):
    """Verifies image preprocessing output tensor shape and type."""
    img = Image.new("RGB", (300, 300), color=(100, 150, 50))
    tensor = classifier.preprocess(img)
    assert isinstance(tensor, np.ndarray)
    assert tensor.shape == (1, 3, 224, 224)
    assert tensor.dtype == np.float32


def test_predict_structure(classifier):
    """Verifies that prediction return dictionary contains all required fields."""
    img = Image.new("RGB", (224, 224), color=(50, 180, 50))
    result = classifier.predict(img)

    assert "disease_code" in result
    assert "disease_name" in result
    assert "crop" in result
    assert "confidence" in result
    assert "status" in result
    assert "top_3" in result
    assert "is_healthy" in result
    assert "latency_ms" in result

    assert isinstance(result["confidence"], float)
    assert result["status"] in ["confident", "uncertain", "unknown"]
    assert len(result["top_3"]) <= 3
    assert result["latency_ms"] > 0


def test_singleton_getter():
    """Verifies singleton pattern getter."""
    inst1 = get_disease_classifier()
    inst2 = get_disease_classifier()
    assert inst1 is inst2
