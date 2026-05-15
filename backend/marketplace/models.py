from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Service(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='services'
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='services'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
            models.Index(fields=['provider']),
        ]

    def __str__(self):
        return self.title

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='bookings'
    )
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        null=True,
        blank=True
    )
    bid = models.ForeignKey(
        'Bid',
        on_delete=models.SET_NULL,
        related_name='bookings',
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.service.title if self.service else 'Job-based'} ({self.status})"

    @property
    def payment_status(self):
        if hasattr(self, 'payment') and self.payment.status == 'completed':
            return 'paid'
        return 'unpaid'

class Job(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('completed', 'Completed'),
    ]

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['budget']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title

class Bid(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='bids'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bids'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['job', 'provider'], name='unique_bid_per_provider')
        ]

    def __str__(self):
        return f"Bid by {self.provider.email} on {self.job.title}"

class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    booking = models.OneToOneField(
        'Booking',
        on_delete=models.CASCADE,
        related_name='review',
        null=True, # Temporarily null for migration if needed
        blank=True
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Each user can review a specific booking once
        # Note: OneToOneField already ensures uniqueness per booking

    def __str__(self):
        title = self.booking.service.title if (self.booking and self.booking.service) else "Custom Job"
        return f"Review by {self.user.email} for {title}"

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email}: {self.message[:20]}..."

class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations'
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation {self.id}"

class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"From {self.sender.email} at {self.created_at}"

class Milestone(models.Model):
    MILESTONE_STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('completed', 'Completed'),
    )
    
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=MILESTONE_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.title} - {self.amount}"

class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.status}"
