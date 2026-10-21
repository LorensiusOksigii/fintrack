#!/bin/bash
# Helper script untuk menjalankan backend development server di Mac/Linux
# Usage: ./dev.sh

PYTHONPATH=. uvicorn app.main:app --reload
