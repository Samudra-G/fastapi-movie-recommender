# 🎬 Advanced Movie Recommendation System

A **full-stack, production-ready prototype** for a personalized movie recommendation platform — built from scratch by Samudra Mukhar Goswami.

## 🚀 What does it do?

* **Content-based filtering:** Uses BERT embeddings for movie descriptions & titles.
* **Personalized recommendations:** Computes cosine similarity with the user’s watch history in real time.
* **Smart caching:** Redis-powered, so repeated requests are blazing fast.
* **Fully async backend:** FastAPI + PostgreSQL + SQLAlchemy (async) + asyncpg.
* **Robust pipeline:** Handles cold starts, watch history updates, background re-ranking.
* **Frontend:** Built with React + Axios — supports browsing, searching, genre filters & recs.
* **Containerization ready:** Next up — Docker and production database snapshotting.

## ⚙️ Tech stack

| Layer        | Tech                                                |
| ------------ | --------------------------------------------------- |
| **Backend**  | FastAPI, SQLAlchemy (async), PostgreSQL, asyncpg    |
| **ML/NLP**   | BERT embeddings, cosine similarity, scikit-learn    |
| **Cache**    | Redis                                               |
| **Frontend** | React, Vite, TailwindCSS, Axios                     |
| **DevOps**   | Docker (soon!), .env configs, modern code structure |

## 📌 Key Features

* Watch movies → backend auto-updates your profile embedding → recs refresh automatically.
* Posters, genres & meta fetched dynamically and cached efficiently.
* Supports genre filtering & full-text search.
* Runs well locally or on cloud (API-first).

## 📂 Project structure

```
backend/
 ├── models/
 ├── services/
 ├── routers/
 ├── auth/
 ├── database/
 ├── cache/
 ├── main.py
frontend/
 ├── components/
 ├── services/
 ├── pages/
 ├── App.jsx
```

## 🐳 Coming soon

* Dockerized version with PostgreSQL & Redis containers.
* CI/CD pipeline for clean deploys.
* Load balancing & async task queues if needed.

## ✨ How to run

1. Clone the repo.
2. Set up `.env` for DB & Redis.
3. `make uvicorn` for backend.
4. `make run` for frontend.
5. Use `/docs` for API testing.

---

**🫡 From zero to prototype — built, tested, and iterated in pure Python + JS hustle.**

---

**Made with caffeine & determination by Samudra Mukhar Goswami.**
