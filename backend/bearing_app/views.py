from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .ml_model import predictor
from .models import PredictionHistory
import json

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def home(request):
    return Response({
        "message": "Predictive Maintenance API is running",
        "endpoints": {
            "health": "/api/health/",
            "predict": "/api/predict/"
        }
    })


class HealthCheckView(APIView):
    def get(self, request):
        return Response({
            'status': 'API is running',
            'model_loaded': True,
            'features': predictor.get_feature_names()
        })

class PredictView(APIView):
    def post(self, request):
        try:
            # Get features from request
            features = request.data.get('features', [])
            
            if len(features) != 20:
                return Response({
                    'success': False,
                    'error': f'Exactly 20 features required, got {len(features)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Make prediction
            result = predictor.predict(features)
            
            # Save to history
            if result.get('success', False):
                PredictionHistory.objects.create(
                    features=features,
                    prediction=result
                )
            
            return Response(result)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerateDemoView(APIView):
    def post(self, request):
        try:
            defect_type = int(request.data.get('defect_type', 0))
            
            if defect_type not in [0, 1, 2, 3]:
                return Response({
                    'success': False,
                    'error': 'defect_type must be 0, 1, 2, or 3'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate demo data
            result = predictor.generate_demo_data(defect_type)
            
            return Response(result)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetFeaturesView(APIView):
    def get(self, request):
        try:
            return Response({
                'success': True,
                'feature_names': predictor.get_feature_names(),
                'feature_descriptions': predictor.get_feature_descriptions(),  # 🔴 ADD THIS LINE
                'feature_count': len(predictor.get_feature_names())
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            })
            
class GetSampleView(APIView):
    def post(self, request):
        try:
            defect_type = int(request.data.get('defect_type', 0))
            sample_features = predictor.get_sample_features(defect_type)
            
            # Make prediction with sample features
            prediction = predictor.predict(sample_features)
            
            return Response({
                'success': True,
                'features': sample_features,
                'prediction': prediction
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            })

class HistoryView(APIView):
    def get(self, request):
        try:
            history = PredictionHistory.objects.all().order_by('-created_at')[:10]
            history_data = []
            
            for item in history:
                history_data.append({
                    'id': item.id,
                    'features': item.features,
                    'prediction': item.prediction,
                    'created_at': item.created_at
                })
            
            return Response({
                'success': True,
                'history': history_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            })