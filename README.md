<div align="center">
  <h1>🌍 EcoAgent: AI-Powered Stochastic Climate Risk System</h1>
  <p><i>An advanced multi-agent system for real-time landslide prediction using stochastic modeling (CIR) and LLM orchestration.</i></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://eco-agent-d0b9gco9q-cmorregofs-projects.vercel.app/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
</div>

---

## 🎯 The Problem & Our Solution
Mountainous regions (like Manizales, Colombia) face constant threats from rain-induced landslides. Traditional alerting systems rely on static thresholds. 

**EcoAgent** solves this by treating soil moisture dynamics as a stochastic process. By bridging **advanced mathematics (SDEs)** with **Agentic AI**, the system not only simulates risk but also reasons through live data to trigger intelligent, multi-modal alerts.

## 🚀 Key Features
- **🧠 Agentic Orchestration:** Intelligent decision-making powered by **GPT-4o-mini** and **Llama 3.3** using LangChain.
- **📈 Stochastic Math Engine:** Uses the *Euler-Maruyama* method to solve the *Cox-Ingersoll-Ross (CIR)* equation for soil saturation modeling.
- **🌤️ Live Data Integration:** Real-time environmental metrics ingestion via the Open-Meteo API.
- **🎙️ Multimodal Alerts:** Automated Telegram Bot alerts and premium voice synthesis via ElevenLabs.
- **☁️ Cloud Native:** Fully containerized with Docker and deployed on Vercel (Frontend) and FastAPI (Backend).

## 📐 Architecture Flow
*(Nota para ti: Aquí debes entrar a Eraser.io, hacer un diagrama simple de cómo se conectan el Frontend, FastAPI, LangChain y ElevenLabs, tomarle foto y subirla aquí como `![Architecture](./docs/arch.png)`)*

## 🧪 The Math Behind The AI
Instead of deterministic limits, our Python engine calculates soil moisture ($X_t$) using the **Cox-Ingersoll-Ross (CIR)** model:

$$dX_t = a(b - X_t)dt + \sigma \sqrt{X_t} dW_t$$

Where the AI agent interprets the resulting probability distributions to assess whether a critical failure threshold is imminent.

## 💻 Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/The-Velveteen-Project/EcoAgent.git
cd EcoAgent
```

2. **Environment Configuration:**
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   > 🔑 **Note:** You will need API keys for **Telegram**, **OpenRouter**, and **ElevenLabs**.

3. **Launch with Docker (Production Ready)**
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

<div align="center">
<b>Developed by Carlos M. Orrego | Lead AI Researcher @ The Velveteen Project</b>
</div>


