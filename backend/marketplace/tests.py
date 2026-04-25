from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Category, Service, Booking
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
        self.assertLess(len(queries), 5) 

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
        # Create a booking for self.customer
        Booking.objects.create(user=self.customer, service=self.service)
        
        # Another user's booking
        other_user = User.objects.create_user(email="other@test.com", password="password")
        Booking.objects.create(user=other_user, service=self.service)

        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.booking_url)
        # Should only see 1 (their own) + any they provide (none yet)
        # Actually, in the viewset logic: (user=user) | (service__provider=user)
        # self.customer is not the provider, so they only see 1.
        self.assertEqual(len(response.data), 1)

    def test_provider_sees_bookings(self):
        Booking.objects.create(user=self.customer, service=self.service)
        
        self.client.force_authenticate(user=self.provider)
        response = self.client.get(self.booking_url)
        # Provider should see the booking for their service
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['service_title'], "Fix Leak")
