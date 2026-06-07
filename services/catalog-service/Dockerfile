FROM python:alpine

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Workspace metadata and shared package (required by [tool.uv.sources])
COPY pyproject.toml uv.lock ./
COPY packages/shared packages/shared
COPY services/catalog-service/pyproject.toml services/catalog-service/pyproject.toml

RUN uv sync --frozen --no-cache --no-dev --no-editable --package catalog-service

COPY services/catalog-service/app catalog-service/app/
COPY services/catalog-service/migrations catalog-service/migrations/
COPY services/catalog-service/alembic.ini catalog-service/alembic.ini

WORKDIR /app/catalog-service

ENV PYTHONPATH=/app/catalog-service
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8001

CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
