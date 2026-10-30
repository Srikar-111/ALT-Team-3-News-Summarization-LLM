# 📰 Automatic News Summarization Using Large Language Models

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Hugging Face Transformers](https://img.shields.io/badge/Hugging%20Face-Transformers-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/docs/transformers)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Srikar-111/ALT-Team-3-News-Summarization-LLM/blob/main/notebooks/News_Summarization_Colab.ipynb)

A comparative study of transformer models and large language models for generating concise, coherent, and informative news summaries.

## 🎓 Course information

| Field | Value |
|---|---|
| Group | TEAM-3 |
| Course | APPLIED MACHINE LEARNING FOR TEXT ANALYSIS |
| Section | S4 |

## 👥 Team members

| S.No. | Roll No. | Student Name |
|---:|---|---|
| 1 | 2420030187 | G. Venkata Varun |
| 2 | 2420030111 | Srikar Jonnalagadda |
| 3 | 2420030228 | K. Pranav |

## 📝 Abstract

This project compares T5, BART, Pegasus, and a large language model for abstractive news summarization using the CNN/DailyMail and XSum datasets. Summary quality is assessed using ROUGE-1, ROUGE-2, and ROUGE-L, alongside qualitative review of coherence, fluency, factual consistency, semantic relevance, and readability. The project also provides an application for generating, comparing, and evaluating summaries.

## 🎯 Objectives

- Compare T5, BART, Pegasus, and a large language model on news summarization.
- Evaluate generated summaries quantitatively with ROUGE and qualitatively against human-review criteria.
- Analyze performance across CNN/DailyMail and XSum.
- Build an application for generating, comparing, and evaluating summaries.

## 📚 Datasets

| Name | Description | Link |
|---|---|---|
| CNN/DailyMail | News articles paired with multi-sentence reference summaries. | [Kaggle dataset](https://www.kaggle.com/datasets/gowrishankarp/newspaper-text-summarization-cnn-dailymail) |
| XSum | News documents paired with highly abstractive, typically single-sentence summaries. | [Hugging Face dataset](https://huggingface.co/datasets/EdinburghNLP/xsum) |

The code loads `cnn_dailymail` (config `3.0.0`) and `xsum` from Hugging Face `datasets`.

## 🔄 Approach / pipeline

1. Load news articles from the datasets.
2. Clean and preprocess the text, including sentence segmentation and chunking of long articles.
3. Generate summaries using T5, BART, Pegasus, or an LLM.
4. Evaluate summaries with ROUGE when a reference summary is available.
5. Compare scores and review summary quality.

## 🤖 Models compared

| Model | Checkpoint / service | Description |
|---|---|---|
| T5 | `t5-small` | Text-to-text model; input is prefixed with `summarize:`. |
| BART | `sshleifer/distilbart-cnn-12-6` | Distilled BART checkpoint fine-tuned for CNN/DailyMail summarization. |
| Pegasus | `google/pegasus-xsum` | Summarization checkpoint fine-tuned on XSum. |
| LLM | Groq API; configured by `GROQ_MODEL` | Code default: `llama3-70b-8192`; requires an API key. |

Local checkpoints are downloaded on first use. The model manager loads models lazily and limits how many are kept in memory using `MAX_LOADED_MODELS`.

## 📏 Evaluation metrics

| Metric | Description |
|---|---|
| ROUGE-1 | Unigram overlap F1 against a reference summary. |
| ROUGE-2 | Bigram overlap F1 against a reference summary. |
| ROUGE-L | Longest common subsequence F1 against a reference summary. |
| Coherence | Human assessment of logical flow and structure. |
| Fluency | Human assessment of natural, grammatical language; covered by the readability rubric in the interface. |
| Factual consistency | Human assessment of whether the summary is supported by the article. |
| Semantic relevance | Human assessment of whether important information is retained. |
| Readability | Human assessment of clarity and ease of reading. |

ROUGE is calculated with `rouge-score` and stemming when a reference is supplied. Human quality ratings are optional 1–5 ratings and are not automatically computed by the backend.

## 📊 Results

The following table summarizes the project's reported ROUGE scores for each model and dataset.

| Model | Dataset | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---:|---:|---:|
| T5 | CNN/DailyMail | 0.35 | 0.13 | 0.25 |
| T5 | XSum | 0.30 | 0.09 | 0.22 |
| BART | CNN/DailyMail | 0.42 | 0.20 | 0.31 |
| BART | XSum | 0.34 | 0.13 | 0.27 |
| Pegasus | CNN/DailyMail | 0.35 | 0.13 | 0.26 |
| Pegasus | XSum | 0.43 | 0.20 | 0.34 |
| LLM | CNN/DailyMail | 0.39 | 0.17 | 0.28 |
| LLM | XSum | 0.34 | 0.13 | 0.25 |

### Summary of the supplied results

- **CNN/DailyMail:** BART has the highest listed scores: ROUGE-1 0.42, ROUGE-2 0.20, and ROUGE-L 0.31.
- **XSum:** Pegasus has the highest listed scores: ROUGE-1 0.43, ROUGE-2 0.20, and ROUGE-L 0.34.
- ROUGE measures overlap with reference summaries; it does not by itself establish factual consistency, coherence, or readability.

## 🗂️ Project structure

```text
.
├── backend/
│   ├── api/routes.py
│   ├── config/settings.py
│   ├── schemas/models.py
│   ├── services/
│   │   ├── evaluation.py
│   │   ├── experiment.py
│   │   ├── model_manager.py
│   │   ├── preprocessing.py
│   │   └── summarizers.py
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── docs/TEAM-3_Project_Abstract.pdf
├── frontend/
│   ├── src/app/
│   ├── src/components/
│   ├── src/hooks/useSummarize.ts
│   ├── src/lib/
│   ├── package.json
│   └── Dockerfile
├── scripts/run_experiment.py
├── tests/
├── .env.example
├── docker-compose.yml
├── pytest.ini
├── requirements.txt
├── test_api.py
└── README.md
```

The `data/` and `outputs/` directories are reserved for local data and generated results. Dataset files, model checkpoints, environment files, Python caches, and frontend dependencies are excluded from Git.

## ⚙️ Installation and usage

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Optional: a Groq API key for the LLM summarizer

### Set up the backend

From the repository root:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
python -m pip install -r requirements.txt
```

To configure the optional Groq model, copy `.env.example` to `.env` and set `GROQ_API_KEY` to your own key. Do not commit `.env`.

### Run the application

Start the backend from the repository root:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The web app is available at `http://localhost:3000`; FastAPI documentation is at `http://localhost:8000/docs`.

### Run a dataset experiment

```bash
python scripts/run_experiment.py --dataset cnn_dailymail --num_samples 5
python scripts/run_experiment.py --dataset xsum --num_samples 10 --models t5 bart
```

Add `--include-llm` to include the Groq model; this requires `GROQ_API_KEY`. Results are saved under `outputs/experiments/`.

### Run with Docker Compose

```bash
docker compose up --build
```

## 🚀 Future work and conclusion

Potential next steps include running larger reproducible experiments, preserving result files and settings, adding automated fluency and factual-consistency evaluation, persisting human ratings, and expanding model and dataset coverage. The reported results show BART has the highest listed ROUGE scores on CNN/DailyMail, while Pegasus has the highest listed scores on XSum. ROUGE measures overlap with reference summaries and does not by itself establish factual consistency, coherence, or readability.

## 🙏 Acknowledgements

Add contributors, tools, or institutional acknowledgements if required by the course.
