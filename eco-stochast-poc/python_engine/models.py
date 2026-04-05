# ---
# 📚 POR QUÉ: Define modelos Pydantic v2 con validación física y documentación inline.
#    Cada campo tiene Field(description=...) explicando la física subyacente, lo que
#    permite generar documentación API automática en /docs. Los validators rechazan
#    inputs físicamente imposibles (precipitación negativa, exceso de simulaciones)
#    ANTES de que lleguen al motor SDE — fail fast.
# 📁 ARCHIVO: eco-stochast-poc/python_engine/models.py
# ---

from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

from config import settings


class AlertLevel(StrEnum):
    """Discrete risk classification derived from Monte Carlo simulation."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class CIRSimulationInput(BaseModel):
    """Input parameters for the Cox-Ingersoll-Ross stochastic simulation."""

    precipitation_mm: float = Field(
        ...,
        ge=0,
        description="Accumulated precipitation in mm. Drives soil moisture increase in the CIR drift term.",
    )
    humidity_pct: float = Field(
        ...,
        ge=0,
        le=100,
        description="Relative humidity (0–100%). Amplifies the long-term mean 'b' in the CIR model.",
    )
    temperature_c: float = Field(
        ...,
        description="Air temperature in °C. Higher temps increase evapotranspiration, reducing soil saturation.",
    )
    n_simulations: int = Field(
        default=1000,
        ge=1,
        le=10000,
        description="Number of Monte Carlo paths to simulate. More paths = higher statistical confidence.",
    )
    time_horizon_hours: float = Field(
        default=24,
        gt=0,
        description="Forward projection horizon in hours. Longer = more uncertainty in the forecast.",
    )

    @field_validator("n_simulations")
    @classmethod
    def check_max_simulations(cls, v: int) -> int:
        if v > settings.max_simulations:
            raise ValueError(
                f"n_simulations ({v}) exceeds maximum allowed ({settings.max_simulations})"
            )
        return v

    @field_validator("precipitation_mm")
    @classmethod
    def check_precipitation(cls, v: float) -> float:
        if v < 0:
            raise ValueError("precipitation_mm cannot be negative")
        return v


class CIRSimulationOutput(BaseModel):
    """Result of the CIR stochastic simulation."""

    risk_probability: float = Field(
        ...,
        ge=0,
        le=1,
        description="Probability of exceeding critical soil saturation (0–1).",
    )
    mean_saturation: float = Field(
        ...,
        description="Mean soil saturation level across all Monte Carlo paths.",
    )
    std_saturation: float = Field(
        ...,
        ge=0,
        description="Standard deviation of saturation — quantifies simulation uncertainty.",
    )
    alert_level: AlertLevel = Field(
        ...,
        description="Discrete alert classification: LOW, MEDIUM, HIGH, CRITICAL.",
    )

    @property
    def is_high_risk(self) -> bool:
        """Whether the alert level requires immediate attention."""
        return self.alert_level in (AlertLevel.HIGH, AlertLevel.CRITICAL)

    @property
    def summary(self) -> str:
        """Human-readable summary ready to send to the LLM."""
        return (
            f"Nivel de riesgo: {self.alert_level.value}. "
            f"Probabilidad: {self.risk_probability:.1%}. "
            f"Saturación media: {self.mean_saturation:.4f} ± {self.std_saturation:.4f}."
        )
