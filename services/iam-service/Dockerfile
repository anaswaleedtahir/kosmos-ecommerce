FROM python:alpine

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Workspace metadata and shared package (required by [tool.uv.sources])
COPY pyproject.toml uv.lock ./
COPY packages/shared packages/shared
COPY services/iam-service/pyproject.toml services/iam-service/pyproject.toml

RUN uv sync --frozen --no-cache --no-dev --no-editable --package iam-service

# Runtime service shape
COPY services/iam-service/app iam-service/app
COPY services/iam-service/migrations iam-service/migrations
COPY services/iam-service/alembic.ini iam-service/alembic.ini

WORKDIR /app/iam-service

RUN mkdir -p keys

ENV PYTHONPATH=/app/iam-service
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]