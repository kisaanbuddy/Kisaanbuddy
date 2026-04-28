from fastapi import APIRouter

router = APIRouter()

# In a real app, this could be fetched from data.gov.in or a database
MOCK_SCHEMES_DB = [
    {
        "id": 1,
        "name": "PM Kisan Samman Nidhi",
        "description": "Income support of Rs. 6,000/- per year in three equal installments to all land holding farmer families.",
        "eligibility": "Small and Marginal Farmers",
        "link": "https://pmkisan.gov.in/",
        # YouTube how-to-apply tutorial (verified working — oEmbed 200).
        "youtubeLink": "https://www.youtube.com/watch?v=EuFPgYYc7A0"
    },
    {
        "id": 2,
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "description": "Crop insurance scheme providing financial support to farmers in case of crop failure due to natural calamities.",
        "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops",
        "link": "https://pmfby.gov.in/",
        "youtubeLink": "https://www.youtube.com/watch?v=yOqTKYqMXa8"
    },
    {
        "id": 3,
        "name": "Soil Health Card Scheme",
        "description": "Provides farmers with a Soil Health Card detailing soil nutrient status and fertilizer recommendations.",
        "eligibility": "All land holding farmers",
        "youtubeLink": "https://www.youtube.com/watch?v=LqfnvJfQC00"
    },
    {
        "id": 4,
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
        "description": "Aims to expand cultivable area under assured irrigation, improve on-farm water use efficiency to reduce wastage of water.",
        "eligibility": "All Farmers",
        "link": "https://pmksy.gov.in/",
        "youtubeLink": "https://www.youtube.com/watch?v=jfnpmqRmgzU"
    },
    {
        "id": 5,
        "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "description": "Promotes organic farming through the adoption of organic village by cluster approach and PGS certification.",
        "eligibility": "Farmers willing to form a cluster of at least 20 hectares",
        "link": "https://pgsindia-ncof.gov.in/",
        "youtubeLink": "https://www.youtube.com/watch?v=219X0uslHT4"
    },
    {
        "id": 6,
        "name": "e-NAM (National Agriculture Market)",
        "description": "A pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.",
        "eligibility": "Registered farmers, FPOs, and Traders",
        "link": "https://enam.gov.in/",
        "youtubeLink": "https://www.youtube.com/watch?v=14VYLsoIJKs"
    }
]

@router.get("/")
def get_schemes():
    return {"schemes": MOCK_SCHEMES_DB}
