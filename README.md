# Smart Service Marketplace

A robust, scalable backend for a service marketplace built with Django Rest Framework (DRF), PostgreSQL, Redis, and Celery.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication for Customers and Providers.
- **Service Management**: Providers can list services with categories, descriptions, and pricing.
- **Booking System**: Real-time booking of services with status tracking (Pending, Confirmed, Completed).
- **Job Bidding**: Customers can post jobs, and providers can bid on them.
- **Review System**: Verified purchase reviews (customers can only review completed services).
- **Notification System**: Real-time-ready notifications for bookings and bids.
- **Async Processing**: Resource-intensive tasks (like sending notifications) are offloaded to Celery workers using Redis.
- **Security**: Global pagination and rate limiting (throttling) to prevent abuse.

## 🛠️ Tech Stack

- **Backend**: Django 5.x, Django REST Framework
- **Database**: PostgreSQL
- **Task Queue**: Celery
- **Message Broker**: Redis
- **Auth**: SimpleJWT

## 📂 API Endpoints

### Accounts
- `POST /api/accounts/register/`: Register a new user (Customer or Provider).
- `POST /api/accounts/login/`: Obtain JWT tokens.
- `GET /api/accounts/me/`: Get current user profile.

### Marketplace
- `GET /api/categories/`: List all service categories.
- `GET /api/services/`: List/Filter services (includes average ratings).
- `POST /api/bookings/`: Create a booking.
- `GET /api/jobs/`: List/Create jobs (Customers only).
- `POST /api/bids/`: Bid on a job (Providers only).
- `POST /api/bids/{id}/accept_bid/`: Accept a bid (creates a booking automatically).
- `GET /api/notifications/`: List user notifications.

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Redis Server
- PostgreSQL

### Installation
1. **Clone the repository**
2. **Setup Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   ```
3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure Environment**
   Create a `.env` file based on `.env.example`.
5. **Run Migrations**
   ```bash
   python manage.py migrate
   ```
6. **Start Redis**
   Ensure your local Redis server is running (`redis-server`).
7. **Start Celery Worker**
   ```bash
   celery -A config worker --loglevel=info
   ```
8. **Run Server**
   ```bash
   python manage.py runserver
   ```

## 🧪 Testing
Run the comprehensive test suite:
```bash
python manage.py test
```
