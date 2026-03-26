# LeaseUp Intelligence

A full-stack analytics project combining **Python data analysis** with an **interactive React dashboard** to explore lease-up performance across 249 multifamily properties in Austin-Round Rock TX and Akron OH. The project moves from raw Excel data through statistical analysis and clustering (Task 1) to a production-grade dashboard with AI-powered insights (Task 2).

## Screenshots

### Overview Dashboard
![Overview — KPIs, yearly trend, and fastest lease-ups](Images/image1.png)

![Overview — Distribution, delivery seasons, worst rent declines, cluster radar, and scatter plots](Images/image2.png)

### AI Assistant
![AI Assistant — Clean chat interface with quick prompt suggestions](Images/image3.png)

### Rent Growth Analysis
![Rent Growth — Stat cards, top 15 worst rent declines, and lease-up vs rent decline scatter](Images/image4.png)

---

## Table of Contents

- [Screenshots](#screenshots)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Task 1 — Data Analysis (Python)](#task-1--data-analysis-python)
- [Task 2 — Interactive Dashboard (React)](#task-2--interactive-dashboard-react)
- [AI Architecture & Prompt Engineering](#ai-architecture--prompt-engineering)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [GenAI Usage Disclosure](#genai-usage-disclosure)

---

## Live Demo

> _Add your deployed URL here after hosting._

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Data Analysis | Python, Pandas, NumPy, Scikit-learn, Sentence-Transformers, UMAP, Plotly |
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion, CSS Transitions |
| AI | OpenRouter API (MiniMax M2.5) |
| Streaming | Server-Sent Events (SSE) via ReadableStream |

---

## Task 1 — Data Analysis (Python)

**Notebook**: `MSA_Analysis.ipynb`

The analysis starts from two raw Excel files (MSA1 and MSA2), each containing four sheets of monthly time-series data (rent, occupancy & concessions, asset class, property status) spanning April 2008 to September 2020.

### 1.1 — Delivered Properties Since April 2008
Filtered the dataset to properties that genuinely entered the market as new deliveries (first status = LU or UC/LU). Austin had 247 qualifying properties; Akron had 2. Austin showed noticeable delivery spikes in 2014 and 2019, reflecting stronger development cycles.

### 1.2 — Average Lease-Up Time
Measured as months from first LU status to reaching 90% occupancy. Austin averaged 12.9 months with a right-skewed distribution — most properties stabilized within a year, but a tail of slower performers pulled the average up. Overall portfolio: 12.8 months average, 12 months median.

### 1.3 — Negative Effective Rent Growth During Lease-Up
42% of properties (104 out of 249) experienced negative effective rent growth during lease-up, meaning they had to reduce rents or increase concessions to reach occupancy targets. Properties with negative rent growth also tended to have longer lease-up periods, suggesting weak pricing and slow absorption go hand in hand.

### 1.4 — Feature Engineering
Five features were engineered to predict lease-up speed:
- **Early Occupancy Growth** (strongest predictor, r = −0.38 with lease-up time)
- **Delivery Season** (Q2/spring deliveries leased fastest)
- **Concession Intensity** (higher concessions correlated with slower lease-up)
- **Price Premium vs Submarket** (above-market pricing slowed absorption)
- **Rent Growth During Lease-Up**

### 1.5 — Embedding-Based Property Clustering
Used sentence-transformer embeddings on property feature profiles, then applied K-Means clustering (k=5) and UMAP for 2D projection:

| Cluster | Label | Properties | Avg Lease-Up | Concession | Price Premium |
|---------|-------|-----------|-------------|-----------|--------------|
| 0 | High Concession | 44 | 12.9 mo | 14.2% | 18.3% |
| 1 | Mid Market | 106 | 14.0 mo | 9.8% | 22.1% |
| 2 | Premium Pricing | 51 | 14.1 mo | 11.2% | 47.8% |
| 3 | Fast Lease-Up | 47 | 9.0 mo | 8.1% | 12.4% |
| 4 | Outlier | 1 | 1.0 mo | — | — |

**Key takeaway**: Austin is a high-reward but high-competition market where timing (seasonality) and early-stage momentum are the best predictors of investment success. If momentum isn't established within 90 days of delivery, there is a 40%+ chance the asset will require rent cuts to reach stabilization.

---

## Task 2 — Interactive Dashboard (React)

A single-page application with a three-panel push layout: collapsible left sidebar, scrollable main content, and a slide-in contextual AI panel that pushes (not overlays) the content.

### Dashboard Pages

**Overview** — KPI cards (avg lease-up, median, negative rent growth %, fast lease-ups), lease-up distribution histogram, delivery season chart, yearly trend line, portfolio composition donut, cluster radar, scatter plots, worst rent declines list, correlation heatmap.

**Lease-Up Analysis** — Three sub-tabs: Time Patterns (bar charts by delivery year and season), Feature Correlations (5×5 heatmap matrix), Building Age (box plot comparing new vs recent construction).

**Rent Growth** — Summary stat cards, horizontal bar chart of top 15 worst-performing properties, scatter plot of lease-up time vs rent decline, searchable/sortable data table.

**Cluster Explorer** — UMAP 2D scatter projection, interactive color-by/size-by controls, 5 cluster stat cards, radar chart overlaying cluster profiles.

**AI Assistant** — Dedicated full-page chat interface for real estate Q&A with inline chart rendering (see AI section below).

### Design System
- Background: `#F8F9FC`, Cards: white with `rounded-2xl shadow-sm`
- Primary: Indigo `#6366F1`, Secondary: Cyan `#06B6D4`
- Typography: Inter font family
- Animations: page fade-in, KPI count-up, smooth panel transitions (300ms cubic-bezier)

---

## AI Architecture & Prompt Engineering

The dashboard includes two distinct AI systems, both powered by the **MiniMax M2.5** model via OpenRouter.

### Dual AI Design

| Component | Purpose | File |
|-----------|---------|------|
| **Contextual Sidebar** | Page-aware assistant that sees what's on screen | `useContextualAI.js` → `AIPanel.jsx` |
| **Full AI Assistant** | Dedicated chat page with inline chart rendering | `useOpenRouter.js` → `AIAssistant.jsx` |

### Prompt Engineering Techniques

**1. In-Prompt Data Grounding (Context Stuffing)**
All 249-property summary statistics (~800 tokens of cluster breakdowns, correlations, top declines, distributions) are embedded directly in the system prompt. This eliminates the need for a RAG pipeline since the entire dataset summary fits within the model's context window, guaranteeing 100% recall with zero retrieval latency.

**2. Dynamic Page Context Injection**
The contextual sidebar receives a detailed description of whichever dashboard page the user is currently viewing — visible charts, KPI values, axis labels — so it can answer "what does this chart show?" without needing vision capabilities.

**3. Few-Shot Prompting**
Three example Q&A pairs are embedded in the full assistant's system prompt, and two in the sidebar's prompt, teaching the LLM the expected response style:
- Data-driven (cite specific numbers)
- Concise (3–6 sentences for full assistant, 2–4 for sidebar)
- Reference cluster names, property names, and correlation values

**4. Chain-of-Thought Reasoning**
The system prompt instructs the model to "briefly reason through the relevant data points before stating your conclusion" for analytical or comparative questions, improving accuracy on multi-step reasoning tasks.

**5. Topic Guardrailing**
A hard constraint in the system prompt restricts the model to real estate topics only. Off-topic queries receive a polite redirect rather than an answer.

**6. Chart-Aware Response Steering**
When a user's question matches a topic keyword (e.g., "rent decline", "delivery season"), the `detectChartRequest()` function in `useChartGenerator.js` automatically selects and attaches the relevant pre-built chart. The system prompt then receives an additional instruction: _"A [type] chart titled '[title]' has been generated and is being shown to the user. Explain what this chart shows."_

### Chart Detection System

The `useChartGenerator.js` file contains a registry of 10 chart configurations, each with topic keywords. When a user asks a question, the `detectChartRequest()` function scores each chart by keyword overlap and selects the best match. Charts are rendered inline in the chat using Recharts. Example triggers:

| Question Topic | Chart Rendered |
|----------------|---------------|
| "lease-up distribution" / "how long to stabilize" | Lease-Up Duration Histogram |
| "delivery season" / "best time to deliver" | Seasonal Distribution Bar Chart |
| "rent decline" / "worst properties" | Top 10 Worst Rent Declines (horizontal bar) |
| "cluster comparison" / "fastest cluster" | Cluster Avg Lease-Up Comparison |
| "price premium" / "pricing impact" | Price vs Lease-Up Scatter Plot |
| "trend over time" / "2008 crisis" | Yearly Lease-Up Trend Line |
| "concession rates" / "discounts" | Concession Rates by Cluster |
| "austin vs akron" / "market comparison" | Market Comparison Bar Chart |
| "building age" / "new vs old" | Building Age Pie Chart |
| "portfolio composition" / "cluster distribution" | Portfolio Composition Pie Chart |

---

## Project Structure

```
leaseup-intelligence/
├── MSA_Analysis.ipynb                   # Python data analysis notebook
├── MSA1.xlsx                            # Raw dataset (Austin-Round Rock TX)
├── index.html                           # Vite entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                                 # API key (not committed)
└── src/
    ├── main.jsx                         # React entry
    ├── App.jsx                          # Layout shell (sidebar + main + AI panel)
    ├── data/
    │   └── dataset.js                   # All hardcoded dashboard data
    ├── hooks/
    │   ├── useOpenRouter.js             # Full AI assistant (prompt + streaming)
    │   ├── useContextualAI.js           # Contextual sidebar AI (prompt + streaming)
    │   ├── useAIPanel.js                # Panel open/close state management
    │   └── useChartGenerator.js         # Chart registry + keyword detection
    ├── components/
    │   ├── Sidebar.jsx                  # Collapsible left navigation
    │   ├── Header.jsx                   # Top bar with page title + Ask AI button
    │   ├── KPICard.jsx                  # Reusable KPI metric card
    │   ├── AIPanel.jsx                  # Right slide-in contextual AI panel
    │   └── pages/
    │       ├── Overview.jsx             # Main dashboard with KPIs and charts
    │       ├── LeaseUpAnalysis.jsx       # Time patterns, correlations, building age
    │       ├── RentGrowth.jsx           # Rent decline analysis and data table
    │       ├── ClusterExplorer.jsx       # UMAP, cluster cards, radar chart
    │       └── AIAssistant.jsx          # Full-page AI chat with inline charts
    └── styles/
        └── index.css                    # Tailwind directives + custom styles
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- An OpenRouter API key ([get one free](https://openrouter.ai))

### Installation

```bash
git clone https://github.com/Tarun-032/MSA-leaseup-analysis.git
cd MSA-leaseup-analysis
npm install
```

### Configuration

Create a `.env` file in the project root:

```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENROUTER_API_KEY` | API key from [OpenRouter](https://openrouter.ai) for AI chat features | Yes (for AI) |

The dashboard charts and pages work without the API key — only the AI chat features require it.

---

## GenAI Usage Disclosure

Generative AI tools were used throughout this project:

- **Google Gemini** (within Google Sheets and Colab) — understanding dataset structure, debugging, interpreting error messages
- **Claude** — code generation, prompt engineering design, architectural decisions, debugging
- **Cursor IDE** — AI-assisted development for the React dashboard

All AI-generated outputs were reviewed, tested, and modified as needed. The final analysis, interpretations, and architectural decisions reflect the My own understanding.
