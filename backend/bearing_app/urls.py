from django.urls import path
from .views import (
    HealthCheckView, PredictView, GenerateDemoView,
    GetFeaturesView, GetSampleView, HistoryView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health'),
    path('predict/', PredictView.as_view(), name='predict'),
    path('demo/generate/', GenerateDemoView.as_view(), name='generate_demo'),
    path('features/', GetFeaturesView.as_view(), name='get_features'),
    path('sample/', GetSampleView.as_view(), name='get_sample'),
    path('history/', HistoryView.as_view(), name='history'),
]