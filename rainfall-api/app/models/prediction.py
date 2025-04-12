from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class PredictionInput(BaseModel):
    """
    Input data model for rainfall prediction
    
    This model matches the columns in your dataset
    """
    YEAR: int = Field(..., description="Year")
    
    # Monthly rainfall fields (can be None if not provided)
    JAN: Optional[float] = Field(None, description="January rainfall")
    FEB: Optional[float] = Field(None, description="February rainfall")
    MAR: Optional[float] = Field(None, description="March rainfall")
    APR: Optional[float] = Field(None, description="April rainfall")
    MAY: Optional[float] = Field(None, description="May rainfall")
    JUN: Optional[float] = Field(None, description="June rainfall")
    JUL: Optional[float] = Field(None, description="July rainfall")
    AUG: Optional[float] = Field(None, description="August rainfall")
    SEP: Optional[float] = Field(None, description="September rainfall")
    OCT: Optional[float] = Field(None, description="October rainfall")
    NOV: Optional[float] = Field(None, description="November rainfall")
    DEC: Optional[float] = Field(None, description="December rainfall")
    
    # Seasonal aggregates
    Jan_Feb: Optional[float] = Field(None, description="January-February rainfall")
    Mar_May: Optional[float] = Field(None, description="March-May rainfall")
    Jun_Sep: Optional[float] = Field(None, description="June-September rainfall")
    Oct_Dec: Optional[float] = Field(None, description="October-December rainfall")
    
    # Annual rainfall
    ANNUAL: Optional[float] = Field(None, description="Annual rainfall")
    
    # Current rain status
    RainToday: Optional[int] = Field(None, description="Whether it's raining today (1) or not (0)")
    
    # Seasonal indicators
    SPRING: Optional[int] = Field(0, description="Spring season indicator")
    SUMMER: Optional[int] = Field(0, description="Summer season indicator")
    MONSOON: Optional[int] = Field(0, description="Monsoon season indicator")
    AUTUMN: Optional[int] = Field(0, description="Autumn season indicator")
    WINTER: Optional[int] = Field(0, description="Winter season indicator")
    
    # One-hot encoded subdivision fields
    SUBDIVISION_ANDAMAN_NICOBAR_ISLANDS: Optional[int] = Field(0)
    SUBDIVISION_ARUNACHAL_PRADESH: Optional[int] = Field(0)
    SUBDIVISION_ASSAM_MEGHALAYA: Optional[int] = Field(0)
    SUBDIVISION_BIHAR: Optional[int] = Field(0)
    SUBDIVISION_CHHATTISGARH: Optional[int] = Field(0)
    SUBDIVISION_COASTAL_ANDHRA_PRADESH: Optional[int] = Field(0)
    SUBDIVISION_COASTAL_KARNATAKA: Optional[int] = Field(0)
    SUBDIVISION_EAST_MADHYA_PRADESH: Optional[int] = Field(0)
    SUBDIVISION_EAST_RAJASTHAN: Optional[int] = Field(0)
    SUBDIVISION_EAST_UTTAR_PRADESH: Optional[int] = Field(0)
    SUBDIVISION_GANGETIC_WEST_BENGAL: Optional[int] = Field(0)
    SUBDIVISION_GUJARAT_REGION: Optional[int] = Field(0)
    SUBDIVISION_HARYANA_DELHI_CHANDIGARH: Optional[int] = Field(0)
    SUBDIVISION_HIMACHAL_PRADESH: Optional[int] = Field(0)
    SUBDIVISION_JAMMU_KASHMIR: Optional[int] = Field(0)
    SUBDIVISION_JHARKHAND: Optional[int] = Field(0)
    SUBDIVISION_KERALA: Optional[int] = Field(0)
    SUBDIVISION_KONKAN_GOA: Optional[int] = Field(0)
    SUBDIVISION_LAKSHADWEEP: Optional[int] = Field(0)
    SUBDIVISION_MADHYA_MAHARASHTRA: Optional[int] = Field(0)
    SUBDIVISION_MATATHWADA: Optional[int] = Field(0)
    SUBDIVISION_NAGA_MANI_MIZO_TRIPURA: Optional[int] = Field(0)
    SUBDIVISION_NORTH_INTERIOR_KARNATAKA: Optional[int] = Field(0)
    SUBDIVISION_ORISSA: Optional[int] = Field(0)
    SUBDIVISION_PUNJAB: Optional[int] = Field(0)
    SUBDIVISION_RAYALSEEMA: Optional[int] = Field(0)
    SUBDIVISION_SAURASHTRA_KUTCH: Optional[int] = Field(0)
    SUBDIVISION_SOUTH_INTERIOR_KARNATAKA: Optional[int] = Field(0)
    SUBDIVISION_SUB_HIMALAYAN_WEST_BENGAL_SIKKIM: Optional[int] = Field(0)
    SUBDIVISION_TAMIL_NADU: Optional[int] = Field(0)
    SUBDIVISION_TELANGANA: Optional[int] = Field(0)
    SUBDIVISION_UTTARAKHAND: Optional[int] = Field(0)
    SUBDIVISION_VIDARBHA: Optional[int] = Field(0)
    SUBDIVISION_WEST_MADHYA_PRADESH: Optional[int] = Field(0)
    SUBDIVISION_WEST_RAJASTHAN: Optional[int] = Field(0)
    SUBDIVISION_WEST_UTTAR_PRADESH: Optional[int] = Field(0)
    
    class Config:
        schema_extra = {
            "example": {
                "YEAR": 2023,
                "JUN": 150.5,
                "MONSOON": 1,
                "SUBDIVISION_KERALA": 1,
                "RainToday": 1
            }
        }

class PredictionOutput(BaseModel):
    """Output data model for rainfall prediction"""
    prediction: float = Field(..., description="Probability of rain tomorrow (0-1)")
    input_data: PredictionInput = Field(..., description="Input data used for prediction")
    confidence: Optional[str] = Field("Medium", description="Confidence level of the prediction (Low, Medium, High)")
    regional_info: Optional[Dict[str, Any]] = Field(None, description="Additional regional information")
