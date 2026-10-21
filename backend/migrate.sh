#!/bin/bash
# Helper script untuk menjalankan Alembic di Mac/Linux
# Usage: ./migrate.sh upgrade head

PYTHONPATH=. alembic "$@"
