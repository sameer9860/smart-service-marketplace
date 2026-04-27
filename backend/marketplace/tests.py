from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Category, Service, Booking, Job, Bid, Review, Notification
from django.test.utils import CaptureQueriesContext
from django.db import connection

User = get_user_model()

class MarketplaceModelTests(TestCase):

    def setUp(self):
        # Create a provider
        self.provider = User.objects.create_user(
            email="provider@test.com",
            password="password123",
            role="provider"
        )
        # Create a customer
        self.customer = User.objects.create_user(
            email="customer@test.com",
            password="password123",
            role="customer"
        )
        # Create a category
        self.category = Category.objects.create(name="Plumbing")

    def test_category_creation(self):
        self.assertEqual(self.category.name, "Plumbing")
        self.assertEqual(str(self.category), "Plumbing")

    def test_service_creation(self):
        service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Fix Leak",
            description="Fixing water leaks in bathroom",
            price=50.00
        )
        self.assertEqual(service.title, "Fix Leak")
        self.assertEqual(service.provider, self.provider)
        self.assertEqual(service.category, self.category)
        self.assertEqual(str(service), "Fix Leak")

    def test_booking_creation(self):
        service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Fix Leak",
            description="Fixing water leaks in bathroom",
            price=50.00
        )
        booking = Booking.objects.create(
            user=self.customer,
            service=service,
            status='pending'
        )
        self.assertEqual(booking.user, self.customer)
        self.assertEqual(booking.service, service)
        self.assertEqual(booking.status, 'pending')
        self.assertIn(self.customer.email, str(booking))
        self.assertIn(service.title, str(booking))

    def test_booking_status_choices(self):
        service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Fix Leak",
            price=50.00
        )
        booking = Booking.objects.create(
            user=self.customer,
            service=service,
            status='confirmed'
        )
        self.assertEqual(booking.status, 'confirmed')

class MarketplaceAPITests(APITestCase):

    def setUp(self):
        self.provider = User.objects.create_user(
            email="api_provider@test.com",
            password="password123",
            role="provider"
        )
        self.customer = User.objects.create_user(
            email="api_customer@test.com",
            password="password123",
            role="customer"
        )
        self.category = Category.objects.create(name="Plumbing")
        self.service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Fix Leak",
            description="Fixing leaks",
            price=50.00
        )
        self.list_url = reverse('service-list')
        self.detail_url = reverse('service-detail', kwargs={'pk': self.service.pk})

    def test_list_services(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_service_unauthenticated(self):
        data = {
            "category": self.category.id,
            "title": "New Service",
            "description": "Desc",
            "price": "100.00"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_service_authenticated(self):
        self.client.force_authenticate(user=self.provider)
        data = {
            "category": self.category.id,
            "title": "New Service",
            "description": "Desc",
            "price": "100.00"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.count(), 2)
        self.assertEqual(response.data['provider'], self.provider.id)

    def test_filter_services_by_category(self):
        new_cat = Category.objects.create(name="Cleaning")
        Service.objects.create(
            provider=self.provider,
            category=new_cat,
            title="Clean House",
            price=30.00
        )
        
        # Filter by Plumbing
        response = self.client.get(f"{self.list_url}?category={self.category.id}")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Fix Leak")

        # Filter by Cleaning
        response = self.client.get(f"{self.list_url}?category={new_cat.id}")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Clean House")

    def test_update_service(self):
        self.client.force_authenticate(user=self.provider)
        data = {"title": "Updated Leak Fix"}
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.service.refresh_from_db()
        self.assertEqual(self.service.title, "Updated Leak Fix")

    def test_delete_service(self):
        self.client.force_authenticate(user=self.provider)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Service.objects.count(), 0)

    def test_service_list_optimization(self):
        for i in range(10):
            Service.objects.create(
                provider=self.provider,
                category=self.category,
                title=f"Service {i}",
                price=10.00
            )
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get(self.list_url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLess(len(queries), 7) 

class BookingAPITests(APITestCase):

    def setUp(self):
        self.provider = User.objects.create_user(
            email="booking_provider@test.com",
            password="password123",
            role="provider"
        )
        self.customer = User.objects.create_user(
            email="booking_customer@test.com",
            password="password123",
            role="customer"
        )
        self.category = Category.objects.create(name="Plumbing")
        self.service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Fix Leak",
            price=50.00
        )
        self.booking_url = reverse('booking-list')

    def test_create_booking_authenticated(self):
        self.client.force_authenticate(user=self.customer)
        data = {"service": self.service.id}
        response = self.client.post(self.booking_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(response.data['user'], self.customer.id)
        self.assertEqual(response.data['status'], 'pending')

    def test_create_booking_unauthenticated(self):
        data = {"service": self.service.id}
        response = self.client.post(self.booking_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_my_bookings(self):
        Booking.objects.create(user=self.customer, service=self.service)
        other_user = User.objects.create_user(email="other@test.com", password="password")
        Booking.objects.create(user=other_user, service=self.service)

        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.booking_url)
        self.assertEqual(len(response.data), 1)

    def test_provider_sees_bookings(self):
        Booking.objects.create(user=self.customer, service=self.service)
        self.client.force_authenticate(user=self.provider)
        response = self.client.get(self.booking_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['service_title'], "Fix Leak")

class JobAndBidAPITests(APITestCase):

    def setUp(self):
        self.customer = User.objects.create_user(
            email="job_customer@test.com",
            password="password123",
            role="customer"
        )
        self.provider = User.objects.create_user(
            email="bid_provider@test.com",
            password="password123",
            role="provider"
        )
        self.job_url = reverse('job-list')
        self.bid_url = reverse('bid-list')

    def test_customer_can_post_job(self):
        self.client.force_authenticate(user=self.customer)
        data = {
            "title": "Paint Room",
            "description": "Need to paint my living room",
            "budget": "200.00"
        }
        response = self.client.post(self.job_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(), 1)

    def test_provider_cannot_post_job(self):
        self.client.force_authenticate(user=self.provider)
        data = {"title": "Test", "description": "Test", "budget": "100.00"}
        response = self.client.post(self.job_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_provider_can_bid(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="Desc", budget=100)
        self.client.force_authenticate(user=self.provider)
        data = {
            "job": job.id,
            "amount": "90.00",
            "message": "I can do it"
        }
        response = self.client.post(self.bid_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Bid.objects.count(), 1)

    def test_customer_cannot_bid(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="Desc", budget=100)
        self.client.force_authenticate(user=self.customer)
        data = {"job": job.id, "amount": "80.00", "message": "Illegal bid"}
        response = self.client.post(self.bid_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_bid_prevention(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="Desc", budget=100)
        self.client.force_authenticate(user=self.provider)
        data = {"job": job.id, "amount": "90.00", "message": "Bid 1"}
        self.client.post(self.bid_url, data)
        
        # Second bid on same job
        response = self.client.post(self.bid_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Bid.objects.count(), 1)

    def test_accept_bid_workflow(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="Desc", budget=100)
        bid = Bid.objects.create(job=job, provider=self.provider, amount=90, message="Hi")
        other_provider = User.objects.create_user(email="other_p@test.com", password="password", role="provider")
        other_bid = Bid.objects.create(job=job, provider=other_provider, amount=95, message="Hello")

        self.client.force_authenticate(user=self.customer)
        url = reverse('bid-accept-bid', kwargs={'pk': bid.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        bid.refresh_from_db()
        other_bid.refresh_from_db()
        job.refresh_from_db()
        
        self.assertEqual(bid.status, 'accepted')
        self.assertEqual(other_bid.status, 'rejected')
        self.assertEqual(job.status, 'closed')
        self.assertEqual(Booking.objects.count(), 1)

    def test_reject_bid(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="Desc", budget=100)
        bid = Bid.objects.create(job=job, provider=self.provider, amount=90, message="Hi")

        self.client.force_authenticate(user=self.customer)
        url = reverse('bid-reject-bid', kwargs={'pk': bid.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bid.refresh_from_db()
        self.assertEqual(bid.status, 'rejected')

class ReviewAPITests(APITestCase):

    def setUp(self):
        self.provider = User.objects.create_user(email="p@test.com", password="p", role="provider")
        self.customer = User.objects.create_user(email="c@test.com", password="p", role="customer")
        self.category = Category.objects.create(name="Test")
        self.service = Service.objects.create(provider=self.provider, category=self.category, title="S", price=100)
        self.review_url = reverse('review-list')

    def test_review_without_booking_fails(self):
        self.client.force_authenticate(user=self.customer)
        data = {"service": self.service.id, "rating": 5, "comment": "Good"}
        response = self.client.post(self.review_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_after_completed_booking_works(self):
        Booking.objects.create(user=self.customer, service=self.service, status='completed')
        self.client.force_authenticate(user=self.customer)
        data = {"service": self.service.id, "rating": 5, "comment": "Great!"}
        response = self.client.post(self.review_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

    def test_invalid_rating_fails(self):
        Booking.objects.create(user=self.customer, service=self.service, status='completed')
        self.client.force_authenticate(user=self.customer)
        data = {"service": self.service.id, "rating": 6, "comment": "Too high"}
        response = self.client.post(self.review_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_avg_rating_aggregation(self):
        Booking.objects.create(user=self.customer, service=self.service, status='completed')
        Review.objects.create(user=self.customer, service=self.service, rating=4, comment="A")
        
        other_customer = User.objects.create_user(email="c2@test.com", password="p", role="customer")
        Booking.objects.create(user=other_customer, service=self.service, status='completed')
        Review.objects.create(user=other_customer, service=self.service, rating=5, comment="B")
        
        response = self.client.get(reverse('service-list'))
        # Average of 4 and 5 is 4.5
        self.assertEqual(response.data[0]['avg_rating'], 4.5)

class NotificationAPITests(APITestCase):

    def setUp(self):
        self.provider = User.objects.create_user(email="p_notify@test.com", password="p", role="provider")
        self.customer = User.objects.create_user(email="c_notify@test.com", password="p", role="customer")
        self.category = Category.objects.create(name="Test")
        self.service = Service.objects.create(provider=self.provider, category=self.category, title="S", price=100)
        self.notify_url = reverse('notification-list')

    def test_booking_triggers_notification(self):
        self.client.force_authenticate(user=self.customer)
        self.client.post(reverse('booking-list'), {"service": self.service.id})
        
        # Check provider's notifications
        self.client.force_authenticate(user=self.provider)
        response = self.client.get(self.notify_url)
        self.assertEqual(len(response.data), 1)
        self.assertIn("New booking received", response.data[0]['message'])

    def test_bid_triggers_notification(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="D", budget=100)
        self.client.force_authenticate(user=self.provider)
        self.client.post(reverse('bid-list'), {"job": job.id, "amount": 90, "message": "Hi"})
        
        # Check customer's notifications
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.notify_url)
        self.assertEqual(len(response.data), 1)
        self.assertIn("New bid received", response.data[0]['message'])

    def test_accept_bid_triggers_notification(self):
        job = Job.objects.create(customer=self.customer, title="Job", description="D", budget=100)
        bid = Bid.objects.create(job=job, provider=self.provider, amount=90, message="Hi")
        
        self.client.force_authenticate(user=self.customer)
        self.client.post(reverse('bid-accept-bid', kwargs={'pk': bid.pk}))
        
        # Check provider's notifications
        self.client.force_authenticate(user=self.provider)
        response = self.client.get(self.notify_url)
        # 1 for booking from service (bid-to-booking creates booking without service link in my current accept_bid logic)
        # Wait, in accept_bid, I create a booking with service=None.
        # So the booking trigger won't fire for provider (since service is None).
        # But the accept_bid trigger WILL fire.
        self.assertEqual(len(response.data), 1)
        self.assertIn("accepted", response.data[0]['message'])

    def test_mark_as_read(self):
        n = Notification.objects.create(user=self.customer, message="Test")
        self.client.force_authenticate(user=self.customer)
        url = reverse('notification-mark-as-read', kwargs={'pk': n.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        n.refresh_from_db()
        self.assertTrue(n.is_read)
