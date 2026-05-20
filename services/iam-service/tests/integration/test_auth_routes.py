from httpx import AsyncClient, Response


async def test_signup_success(client: AsyncClient, viewer_role):
    payload = {
        "email": "new456@example.com",
        "password": "SecurePass2025!",
    }

    response: Response = await client.post("/api/v1/auth/signup", json=payload)

    assert response.status_code == 201

    data = response.json()

    expected_keys = {"id", "email", "created_at"}
    assert set(data.keys()) >= expected_keys, (
        f"Missing keys: {expected_keys - set(data.keys())}"
    )

    assert data["email"] == payload["email"]

    forbidden_keys = {"password", "password_hash", "hashed_password", "username"}
    for key in forbidden_keys:
        assert key not in data, f"Sensitive field '{key}' leaked in response"


async def test_signup_duplicate_email(client, viewer_role):
    payload = {
        "email": "new456@example.com",
        "password": "SecurePass2025!",
    }

    await client.post("/api/v1/auth/signup", json=payload)
    response: Response = await client.post("/api/v1/auth/signup", json=payload)

    assert response.status_code == 409


async def test_login_success(client, viewer_role):
    payload = {
        "email": "new456@example.com",
        "password": "SecurePass2025!",
    }

    await client.post("/api/v1/auth/signup", json=payload)

    response: Response = await client.post("/api/v1/auth/login", json=payload)

    assert response.status_code == 200

    data = response.json()

    expected_keys = {"access_token"}
    assert set(data.keys()) >= expected_keys, (
        f"Missing keys: {expected_keys - set(data.keys())}"
    )

    forbidden_keys = {"password", "password_hash", "hashed_password"}
    for key in forbidden_keys:
        assert key not in data, f"Sensitive field '{key}' leaked in response"

    assert response.cookies.get("refresh_token") is not None


async def test_login_wrong_password(client, viewer_role):
    await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "testuser@example.com",
            "password": "TestPassword123!",
        },
    )

    response: Response = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "WrongPassword123!"},
    )

    assert response.status_code == 401
