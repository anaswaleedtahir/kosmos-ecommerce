import json
import logging
import sys
from datetime import datetime, timezone

from shared.context import request_id

STANDARD_LOGRECORD_ATTRS = frozenset(
    {
        "name",
        "msg",
        "args",
        "levelname",
        "levelno",
        "pathname",
        "filename",
        "module",
        "exc_info",
        "exc_text",
        "stack_info",
        "lineno",
        "funcName",
        "created",
        "msecs",
        "relativeCreated",
        "thread",
        "threadName",
        "processName",
        "process",
        "message",
        "taskName",
        "asctime",
        "color_message",  # uvicorn
    }
)

LOGGERS_TO_SILENCE = [
    "sqlalchemy.engine",
    "sqlalchemy.engine.Engine",
    "httpx",
    "httpcore",
    "uvicorn",
    "uvicorn.error",
    "uvicorn.access",
]


class JSONFormatter(logging.Formatter):
    """GCP-compatible JSON formatter with RFC 3339 timestamps and request ID tracing."""

    def formatTime(self, record: logging.LogRecord) -> str:
        return datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat()

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record),
            "severity": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "filename": record.filename,
            "lineno": record.lineno,
            "request_id": request_id.get(),
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        if record.stack_info:
            log_data["stack_info"] = self.formatStack(record.stack_info)

        for key, value in record.__dict__.items():
            if key not in STANDARD_LOGRECORD_ATTRS:
                log_data[key] = value

        return json.dumps(log_data, default=str)


def setup_dev_logging() -> None:
    """Configure root logger with a simple text formatter at DEBUG level.

    Use in development (app_debug=True). Silences noisy third-party loggers
    the same way setup_logging does, but outputs human-readable text instead of JSON.
    """
    root_logger = logging.getLogger()

    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    for existing_handler in root_logger.handlers[:]:
        root_logger.removeHandler(existing_handler)
        existing_handler.close()

    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(handler)

    for logger_name in LOGGERS_TO_SILENCE:
        third_party_logger = logging.getLogger(logger_name)
        third_party_logger.handlers.clear()
        third_party_logger.setLevel(logging.WARNING)
        third_party_logger.propagate = True


def setup_logging(log_level: str) -> None:
    """Configure root logger with a JSON stdout handler.

    Call once at application startup. Clears existing handlers to prevent
    duplicate log lines across reloads.
    """
    root_logger = logging.getLogger()
    level = _resolve_log_level(log_level)

    formatter = JSONFormatter()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    for existing_handler in root_logger.handlers[:]:
        root_logger.removeHandler(existing_handler)
        existing_handler.close()

    root_logger.setLevel(level)
    root_logger.addHandler(handler)

    for logger_name in LOGGERS_TO_SILENCE:
        third_party_logger = logging.getLogger(logger_name)
        third_party_logger.handlers.clear()
        third_party_logger.setLevel(logging.WARNING)
        third_party_logger.propagate = True


def _resolve_log_level(log_level: str) -> int:
    normalized = log_level.upper()
    level = getattr(logging, normalized, None)
    if level is None:
        raise ValueError(f"Invalid log level: {log_level!r}")
    return level
