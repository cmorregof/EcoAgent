# ---
# 📚 POR QUÉ: Centraliza la configuración del motor Python con pydantic-settings.
#    Los parámetros CIR (a, b, sigma) son calibrados para Manizales y deben ser
#    fácilmente ajustables sin tocar código. Sin esto, los parámetros estarían
#    hardcodeados en la función de simulación, imposibles de cambiar en deployment.
# 📁 ARCHIVO: eco-stochast-poc/python_engine/config.py
# ---

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration for the CIR simulation engine."""

    # Server
    port: int = 8000
    log_level: str = "INFO"

    # CIR Model Parameters (calibrated for Manizales, Colombia)
    cir_mean_reversion_speed: float = 0.5   # Parameter 'a': speed of mean reversion
    cir_long_term_mean: float = 0.4         # Parameter 'b': long-term mean (Manizales baseline)
    cir_volatility: float = 0.1             # Parameter 'sigma': diffusion coefficient

    # Simulation Limits
    max_simulations: int = 10000

    class Config:
        env_prefix = "CIR_"


settings = Settings()
