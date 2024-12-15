import pytest
from app import app, db, User, Campaign


@pytest.fixture
def test_client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def register_user(client, name, email, password):
    return client.post(
        "/api/auth/register", json={"name": name, "email": email, "password": password}
    )


def login_user(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_register_user(test_client):
    response = register_user(
        test_client, "Test User", "test@example.com", "password123"
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "User created successfully"
    assert data["user"]["email"] == "test@example.com"
    response = register_user(test_client, "Another User", "test@example.com", "newpass")
    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "Email already exists"


def test_login_user(test_client):
    register_user(test_client, "Test User", "testlogin@example.com", "securepass")
    response = login_user(test_client, "testlogin@example.com", "securepass")
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Login successful"
    assert data["user"]["email"] == "testlogin@example.com"
    response = login_user(test_client, "testlogin@example.com", "wrongpassword")
    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Invalid credentials"


def test_list_users(test_client):
    register_user(test_client, "Alice", "alice@example.com", "alicepass")
    register_user(test_client, "Bob", "bob@example.com", "bobpass")
    response = test_client.get("/debug/users")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2


def test_search_campaigns(test_client):
    register_user(test_client, "Campaign User", "camp@example.com", "pass")
    login_user(test_client, "camp@example.com", "pass")
    with app.app_context():
        user = User.query.filter_by(email="camp@example.com").first()
        new_campaign = Campaign(
            user_id=user.user_id,
            title="Save the Rainforest",
            description="We are raising funds to protect rainforest wildlife",
            goal_amount=10000,
        )
        db.session.add(new_campaign)
        db.session.commit()
    response = test_client.get("/api/campaigns/search?query=rainforest")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "Save the Rainforest"


def test_payment_endpoint(test_client, monkeypatch):
    class MockPaymentIntent:
        @staticmethod
        def create(**kwargs):
            return {"client_secret": "test_secret_key"}

    monkeypatch.setattr("stripe.PaymentIntent", MockPaymentIntent)
    response = test_client.post(
        "/api/payment",
        json={
            "amount": "10",
            "email": "donor@example.com",
            "currency": "usd",
            "description": "Test Donation",
        },
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["client_secret"] == "test_secret_key"
    response = test_client.post(
        "/api/payment", json={"email": "donor@example.com", "currency": "usd"}
    )
    assert response.status_code == 500
    data = response.get_json()
    assert "Invalid amount" in data["message"]


def test_stress_user_registration(test_client):
    # Stress test: register multiple users in quick succession.
    # This isn't a "true" performance test, but it checks whether the code can handle multiple consecutive requests without issues.
    user_count = 50
    for i in range(user_count):
        email = f"user{i}@example.com"
        response = register_user(test_client, f"User{i}", email, "pass123")
        assert response.status_code in (201, 400)
        # Status 201 for newly created users, 400 if email already taken (just in case).
    response = test_client.get("/debug/users")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
