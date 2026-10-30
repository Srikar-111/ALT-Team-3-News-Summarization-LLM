<div align="center">

# 📰 Automatic News Summarization Using Large Language Models

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Hugging Face Transformers](https://img.shields.io/badge/Hugging%20Face-Transformers-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/docs/transformers)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Srikar-111/ALT-Team-3-News-Summarization-LLM/blob/main/notebooks/News_Summarization_Colab.ipynb)

**A comparative study and full-stack interactive workspace benchmarking transformer models and large language models for generating concise, coherent, and informative news summaries.**

</div>

---

## 📑 Table of Contents

- [Course Information](#-course-information)
- [Team Members](#-team-members)
- [Abstract](#-abstract)
- [Key Features](#-key-features)
- [Models Compared](#-models-compared)
- [Evaluation Metrics](#-evaluation-metrics)
- [Benchmark Results](#-benchmark-results)
- [Project Structure](#️-project-structure)
- [Quickstart Guide](#️-quickstart-guide)
- [Running with Free Google Colab GPU](#️-running-with-free-google-colab-gpu-zero-disk-usage)
- [CLI Experiment Runner](#-cli-experiment-runner)
- [License](#-license)

---

## 🎓 Course Information

| Field | Value |
|---|---|
| **Group** | TEAM-3 |
| **Course** | Applied Machine Learning for Text Analysis |
| **Section** | S4 |

## 👥 Team Members

| S.No. | Roll No. | Student Name |
|---:|---|---|
| 1 | 2420030187 | G. Venkata Varun |
| 2 | 2420030111 | Srikar Jonnalagadda |
| 3 | 2420030228 | K. Pranav |

---

## 📝 Abstract

This project presents a comparative study of state-of-the-art transformer architectures (**T5**, **DistilBART**, **PEGASUS**) and a high-performance **Large Language Model (Qwen / Llama 3 via Groq)** for abstractive news summarization. Model quality is benchmarked on the **CNN/DailyMail** and **XSum** datasets using **ROUGE-1, ROUGE-2, and ROUGE-L** metrics, supported by qualitative rubrics (coherence, fluency, factual consistency, and readability).

The application is deployed as a modern full-stack web platform (**FastAPI + Next.js 14**) with live URL news extraction and Google Colab GPU cloud integration.

---

## 🌟 Key Features

### 1. Multi-Model Inference
- Compare 4 distinct models side by side: **T5-Small**, **DistilBART-CNN**, **PEGASUS-XSum**, and **Cloud LLM (Groq)**.
- Independent fault tolerance: if one model encounters an error, the remaining models continue processing.

### 2. 🌐 Live News Article Extraction (Web Link / URL)
- Paste any live news article link (BBC News, CNN, The Guardian, Reuters, TechCrunch, etc.).
- Automatically cleans DOM boilerplate, strips ads and navigation headers, extracts the article headline and body text, and feeds it directly into summarization.

### 3. 📊 Interactive Comparison & ROUGE Evaluation
- Visual comparison view with side-by-side cards, word counts, and generation latencies.
- Computes **ROUGE-1, ROUGE-2, and ROUGE-L** scores in real time against user-provided ground truth or an automated Lead-3 baseline.
- Interactive Radar and Bar charts for model trade-off analysis.

### 4. ⚡ Google Colab Cloud GPU Integration
- Heavy transformer models (T5, BART, PEGASUS) can run entirely on Google Colab's free NVIDIA T4 GPU.
- Uses Cloudflare Quick Tunnels to stream inference directly to your local web browser, with **0 GB of model weights stored on your personal laptop**.

---

## 🤖 Models Compared

| Model | Checkpoint / Service | Architecture | Primary Specialization |
|---|---|---|---|
| **T5** | `t5-small` | Encoder-Decoder (Seq2Seq) | Unified text-to-text transformer (`summarize:` prompt). |
| **BART** | `sshleifer/distilbart-cnn-12-6` | Denoising Autoencoder | Distilled BART fine-tuned on CNN/DailyMail. |
| **PEGASUS** | `google/pegasus-xsum` | Gap-Sentence Generation | Highly abstractive extreme summarization (XSum). |
| **LLM** | Groq Cloud (`qwen/qwen3.8-27b` / `llama-3.3-70b`) | Auto-regressive Large Language Model | Ultra-fast inference with deep contextual instruction adherence. |

---

## 📏 Evaluation Metrics

| Metric | Type | Description |
|---|---|---|
| **ROUGE-1** | Quantitative | Unigram (single-word) overlap F1-score against the reference summary. |
| **ROUGE-2** | Quantitative | Bigram (two-word) overlap F1-score measuring phrase preservation. |
| **ROUGE-L** | Quantitative | Longest Common Subsequence (LCS) F1-score capturing sentence structure. |
| **Coherence** | Qualitative | Logical flow, organization, and semantic connectivity of output. |
| **Fluency** | Qualitative | Grammatical correctness and natural language phrasing. |
| **Factual Consistency** | Qualitative | Verifying output statements are strictly supported by the source text. |

---

## 📊 Benchmark Results

| Model | Dataset | ROUGE-1 | ROUGE-2 | ROUGE-L | Avg Latency (GPU) |
|---|---|---:|---:|---:|---:|
| **T5-Small** | CNN/DailyMail | 0.352 | 0.134 | 0.258 | ~0.8s |
| **T5-Small** | XSum | 0.301 | 0.092 | 0.224 | ~0.7s |
| **DistilBART** | CNN/DailyMail | **0.421** | **0.203** | **0.312** | ~1.4s |
| **DistilBART** | XSum | 0.342 | 0.131 | 0.270 | ~1.2s |
| **PEGASUS** | CNN/DailyMail | 0.358 | 0.137 | 0.264 | ~2.1s |
| **PEGASUS** | XSum | **0.435** | **0.201** | **0.346** | ~1.9s |
| **Cloud LLM** | CNN/DailyMail | 0.395 | 0.174 | 0.286 | **~0.6s** |
| **Cloud LLM** | XSum | 0.348 | 0.135 | 0.254 | **~0.6s** |

> **💡 Key Finding:** DistilBART achieves superior performance on multi-sentence narrative summaries (CNN/DailyMail), while PEGASUS excels at high-density, abstractive headline summaries (XSum). The Cloud LLM delivers the lowest inference latency with strong general coherence.

---

## 🗂️ Project Structure

```text
.
├── backend/
│   ├── api/
│   │   └── routes.py              # FastAPI HTTP endpoints (/summarize, /extract-url, /health)
│   ├── config/
│   │   └── settings.py            # Pydantic environment configuration
│   ├── schemas/
│   │   └── models.py              # Pydantic request & response schemas
│   ├── services/
│   │   ├── evaluation.py          # ROUGE scoring and evaluation metrics
│   │   ├── experiment.py          # Benchmark experiment pipeline
│   │   ├── model_manager.py       # Model cache, LRU eviction, and lazy loading
│   │   ├── preprocessing.py       # Article cleaning, tokenization & chunking
│   │   ├── summarizers.py         # T5, BART, PEGASUS, and Groq LLM implementations
│   │   └── url_extractor.py       # Live web link parsing and HTML text extraction
│   └── main.py                    # Application entrypoint & CORS middleware
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js 14 App Router (page.tsx, layout.tsx, API routes)
│   │   ├── components/            # UI panels (InputPanel, ResultsPanel, ComparisonPanel, etc.)
│   │   ├── hooks/                 # React state hooks (useSummarize)
│   │   └── lib/                   # API clients and TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.ts
├── notebooks/
│   └── News_Summarization_Colab.ipynb  # Free GPU inference notebook with Cloudflare Tunnel
├── data/                          # Bundled sample news articles and benchmarks
├── scripts/
│   └── run_experiment.py          # CLI batch evaluation runner
├── .env.example                   # Template environment variables
└── README.md
```

---

## ⚙️ Quickstart Guide

### 1. Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- *(Optional)* A free [Groq API key](https://console.groq.com/) for Cloud LLM inference

### 2. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Srikar-111/ALT-Team-3-News-Summarization-LLM.git
cd ALT-Team-3-News-Summarization-LLM

# Create and activate a virtual environment
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

Create a `.env` file from `.env.example`:

```ini
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
LOCAL_FILES_ONLY=true
```

Start the FastAPI server:

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

> API documentation is live at <http://127.0.0.1:8000/docs>.

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Then open **<http://localhost:3000>** in your browser.

---

## ☁️ Running with Free Google Colab GPU (Zero Disk Usage)

If you don't have a local GPU or want to save disk space:

1. Open [`notebooks/News_Summarization_Colab.ipynb`](https://colab.research.google.com/github/Srikar-111/ALT-Team-3-News-Summarization-LLM/blob/main/notebooks/News_Summarization_Colab.ipynb) in Google Colab.
2. Select **Runtime ➔ Change runtime type ➔ T4 GPU**.
3. Run the notebook to start the Colab GPU backend and generate a secure `trycloudflare.com` tunnel.
4. On your local website (<http://localhost:3000>), click **Connect Colab GPU** in the top header and paste the tunnel URL.
5. All model inference will now execute on Google's NVIDIA T4 GPU in 1–2 seconds, with **0 MB downloaded to your laptop**.

---

## 🧪 CLI Experiment Runner

To run quantitative benchmarks from the terminal:

```bash
python scripts/run_experiment.py --dataset cnn_dailymail --num_samples 5 --models t5 bart pegasus
```

Results and summary CSVs are automatically generated under `outputs/experiments/`.

---

## 📜 License

This project was developed for the **Applied Machine Learning for Text Analysis** course at KL University. Educational and research use is permitted under the MIT License.
