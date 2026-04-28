from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

@shared_task
def send_notification_task(user_id, message):
    """
    Background task to create a notification in the database.
    This can later be extended to send emails/push notifications.
    """
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(user=user, message=message)
        return f"Notification sent to {user.email}"
    except User.DoesNotExist:
        return "User does not exist"

@shared_task
def test_celery_task():
    return "Celery is working!"
