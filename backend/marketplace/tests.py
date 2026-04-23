from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Category, Service, Booking

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
