from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .nl_parser import NaturalLanguageParser


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_natural_language(request):
    """Parse natural language input to extract diet parameters."""
    
    try:
        user_input = request.data.get('input', '')
        
        if not user_input:
            return Response({
                'error': 'Input text is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        parser = NaturalLanguageParser()
        parsed_data = parser.parse(user_input, request.user)
        
        return Response({
            'success': True,
            'data': parsed_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
