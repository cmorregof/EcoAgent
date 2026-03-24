# 🌍 EcoAgent: Stochastic Climate Risk Bot

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

> **EcoAgent** is an advanced AI system designed to monitor, simulate, and report climate risks. Its primary focus is **landslide prevention** in mountainous regions, specifically tailored for the topography of **Manizales, Colombia**.

---

## 🚀 Key Features

*   **📈 Stochastic Simulation:** Implements the *Euler-Maruyama* method to solve *Cox-Ingersoll-Ross (CIR)* stochastic differential equations for soil saturation risk modeling.
*   **🌤️ Real-time Intelligence:** Seamless integration with **Open-Meteo API** for live weather metrics (Temperature, Precipitation, Humidity).
*   **🎙️ Multimodal Interaction:** 
    *   Personalized **Telegram Bot** interface.
    *   Premium voice responses powered by **ElevenLabs**.
*   **🧠 Agentic Reasoning:** Intelligent decision-making and tool-use powered by **GPT-4o-mini** and **Llama 3.3**.

---

## 📁 Project Structure

```bash
├── 📂 src                  # Core TypeScript bot logic & agent handlers
├── 📂 eco-stochast-poc      # Python-based SDE simulation engine (FastAPI)
├── 📂 docker                # Deployment configuration
├── 📄 Dockerfile            # Production build instructions
└── 📄 docker-compose.yml    # Multi-container orchestration
```

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/cmorregof/EcoAgent.git
   cd EcoAgent
   ```

2. **Environment Configuration:**
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   > 🔑 **Note:** You will need API keys for **Telegram**, **OpenRouter**, and **ElevenLabs**.

3. **Service Credentials:**
   Ensure your Firebase `service-account.json` is located in the root directory.

4. **Launch the system:**
   * **Using Docker (Recommended):**
     ```bash
     docker-compose up -d
     ```
   * **Manual Development:**
     ```bash
     npm run dev
     ```

---

## 🧪 Technical Background
The core engine solves soil moisture dynamics using the **Cox-Ingersoll-Ross (CIR)** stochastic process:

$$dX_t = a(b - X_t)dt + \sigma \sqrt{X_t} dW_t$$

This allows the agent to predict the probability of soil failure based on rainfall intensity and real-time saturation data, providing a scientific basis for landslide alerts.

---

## 🎓 About
*Developed as a Proof of Concept for **MODELLING AND AI for the environmental transition applications**.*
