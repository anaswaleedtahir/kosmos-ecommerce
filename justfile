set positional-arguments

runserver SERVICE:
    if [ -f services/{{ SERVICE }}/justfile ]; then just -f services/{{ SERVICE }}/justfile -d services/{{ SERVICE }} runserver; else cd services/{{ SERVICE }} && uv run uvicorn app.main:app --reload; fi

makemigrations SERVICE message:
    if [ -f services/{{ SERVICE }}/justfile ]; then just -f services/{{ SERVICE }}/justfile -d services/{{ SERVICE }} makemigrations "{{ message }}"; else cd services/{{ SERVICE }} && uv run alembic revision --autogenerate -m "{{ message }}"; fi

migrate SERVICE:
    if [ -f services/{{ SERVICE }}/justfile ]; then just -f services/{{ SERVICE }}/justfile -d services/{{ SERVICE }} migrate; else cd services/{{ SERVICE }} && uv run alembic upgrade head; fi

seed SERVICE:
    if [ -f services/{{ SERVICE }}/justfile ]; then just -f services/{{ SERVICE }}/justfile -d services/{{ SERVICE }} seed; else echo "No seed recipe found for {{ SERVICE }}" && exit 1; fi

test SERVICE *PYTEST_ARGS:
    shift; if [ "${1:-}" = "--" ]; then shift; fi; if [ -f services/{{ SERVICE }}/justfile ]; then just -f services/{{ SERVICE }}/justfile -d services/{{ SERVICE }} -- test "$@"; else cd services/{{ SERVICE }} && uv run pytest "$@"; fi
