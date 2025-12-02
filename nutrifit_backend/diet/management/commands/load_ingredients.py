"""
Management command to load initial ingredient data.
"""

from django.core.management.base import BaseCommand
from diet.models import Ingredient


class Command(BaseCommand):
    help = 'Load initial ingredient data into the database'
    
    def handle(self, *args, **options):
        self.stdout.write('Loading ingredients...')
        
        ingredients_data = [
            # Proteins
            {'name': 'Chicken Breast', 'category': 'protein', 'calories_per_100g': 165, 'protein_per_100g': 31, 'carbs_per_100g': 0, 'fat_per_100g': 3.6, 'fiber_per_100g': 0, 'is_vegetarian': False, 'is_vegan': False, 'image_url': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 'common_allergens': []},
            {'name': 'Salmon', 'category': 'protein', 'calories_per_100g': 208, 'protein_per_100g': 20, 'carbs_per_100g': 0, 'fat_per_100g': 13, 'fiber_per_100g': 0, 'is_vegetarian': False, 'is_vegan': False, 'image_url': 'https://images.pexels.com/photos/1683545/pexels-photo-1683545.jpeg', 'common_allergens': ['shellfish']},
            {'name': 'Eggs', 'category': 'protein', 'calories_per_100g': 155, 'protein_per_100g': 13, 'carbs_per_100g': 1.1, 'fat_per_100g': 11, 'fiber_per_100g': 0, 'is_vegetarian': True, 'is_vegan': False, 'image_url': 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg', 'common_allergens': ['eggs']},
            {'name': 'Tofu', 'category': 'protein', 'calories_per_100g': 76, 'protein_per_100g': 8, 'carbs_per_100g': 1.9, 'fat_per_100g': 4.8, 'fiber_per_100g': 0.3, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg', 'common_allergens': []},
            {'name': 'Greek Yogurt', 'category': 'dairy', 'calories_per_100g': 59, 'protein_per_100g': 10, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4, 'fiber_per_100g': 0, 'is_vegetarian': True, 'is_vegan': False, 'image_url': 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 'common_allergens': ['dairy']},
            
            # Carbs
            {'name': 'Brown Rice', 'category': 'grains', 'calories_per_100g': 111, 'protein_per_100g': 2.6, 'carbs_per_100g': 23, 'fat_per_100g': 0.9, 'fiber_per_100g': 1.8, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/7456396/pexels-photo-7456396.jpeg', 'common_allergens': []},
            {'name': 'Quinoa', 'category': 'grains', 'calories_per_100g': 120, 'protein_per_100g': 4.4, 'carbs_per_100g': 21, 'fat_per_100g': 1.9, 'fiber_per_100g': 2.8, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg', 'common_allergens': []},
            {'name': 'Sweet Potato', 'category': 'carbs', 'calories_per_100g': 86, 'protein_per_100g': 1.6, 'carbs_per_100g': 20, 'fat_per_100g': 0.1, 'fiber_per_100g': 3, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg', 'common_allergens': []},
            {'name': 'Oats', 'category': 'grains', 'calories_per_100g': 389, 'protein_per_100g': 16.9, 'carbs_per_100g': 66, 'fat_per_100g': 6.9, 'fiber_per_100g': 10.6, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg', 'common_allergens': ['gluten']},
            {'name': 'Whole Wheat Bread', 'category': 'grains', 'calories_per_100g': 247, 'protein_per_100g': 13, 'carbs_per_100g': 41, 'fat_per_100g': 3.4, 'fiber_per_100g': 7, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg', 'common_allergens': ['gluten']},
            
            # Vegetables
            {'name': 'Broccoli', 'category': 'vegetables', 'calories_per_100g': 34, 'protein_per_100g': 2.8, 'carbs_per_100g': 7, 'fat_per_100g': 0.4, 'fiber_per_100g': 2.6, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg', 'common_allergens': []},
            {'name': 'Spinach', 'category': 'vegetables', 'calories_per_100g': 23, 'protein_per_100g': 2.9, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4, 'fiber_per_100g': 2.2, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg', 'common_allergens': []},
            {'name': 'Carrots', 'category': 'vegetables', 'calories_per_100g': 41, 'protein_per_100g': 0.9, 'carbs_per_100g': 10, 'fat_per_100g': 0.2, 'fiber_per_100g': 2.8, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg', 'common_allergens': []},
            {'name': 'Bell Peppers', 'category': 'vegetables', 'calories_per_100g': 31, 'protein_per_100g': 1, 'carbs_per_100g': 6, 'fat_per_100g': 0.3, 'fiber_per_100g': 2.1, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg', 'common_allergens': []},
            {'name': 'Tomatoes', 'category': 'vegetables', 'calories_per_100g': 18, 'protein_per_100g': 0.9, 'carbs_per_100g': 3.9, 'fat_per_100g': 0.2, 'fiber_per_100g': 1.2, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', 'common_allergens': []},
            
            # Fruits
            {'name': 'Banana', 'category': 'fruits', 'calories_per_100g': 89, 'protein_per_100g': 1.1, 'carbs_per_100g': 23, 'fat_per_100g': 0.3, 'fiber_per_100g': 2.6, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg', 'common_allergens': []},
            {'name': 'Apple', 'category': 'fruits', 'calories_per_100g': 52, 'protein_per_100g': 0.3, 'carbs_per_100g': 14, 'fat_per_100g': 0.2, 'fiber_per_100g': 2.4, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg', 'common_allergens': []},
            {'name': 'Blueberries', 'category': 'fruits', 'calories_per_100g': 57, 'protein_per_100g': 0.7, 'carbs_per_100g': 14, 'fat_per_100g': 0.3, 'fiber_per_100g': 2.4, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/87818/background-berries-berry-blackberries-87818.jpeg', 'common_allergens': []},
            {'name': 'Strawberries', 'category': 'fruits', 'calories_per_100g': 32, 'protein_per_100g': 0.7, 'carbs_per_100g': 7.7, 'fat_per_100g': 0.3, 'fiber_per_100g': 2, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg', 'common_allergens': []},
            
            # Nuts & Seeds
            {'name': 'Almonds', 'category': 'nuts', 'calories_per_100g': 579, 'protein_per_100g': 21, 'carbs_per_100g': 22, 'fat_per_100g': 50, 'fiber_per_100g': 12.5, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg', 'common_allergens': ['tree nuts']},
            {'name': 'Peanut Butter', 'category': 'nuts', 'calories_per_100g': 588, 'protein_per_100g': 25, 'carbs_per_100g': 20, 'fat_per_100g': 50, 'fiber_per_100g': 6, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/4033328/pexels-photo-4033328.jpeg', 'common_allergens': ['tree nuts']},
            {'name': 'Chia Seeds', 'category': 'nuts', 'calories_per_100g': 486, 'protein_per_100g': 17, 'carbs_per_100g': 42, 'fat_per_100g': 31, 'fiber_per_100g': 34, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/2377045/pexels-photo-2377045.jpeg', 'common_allergens': []},
            
            # Fats
            {'name': 'Avocado', 'category': 'fats', 'calories_per_100g': 160, 'protein_per_100g': 2, 'carbs_per_100g': 9, 'fat_per_100g': 15, 'fiber_per_100g': 7, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg', 'common_allergens': []},
            {'name': 'Olive Oil', 'category': 'fats', 'calories_per_100g': 884, 'protein_per_100g': 0, 'carbs_per_100g': 0, 'fat_per_100g': 100, 'fiber_per_100g': 0, 'is_vegetarian': True, 'is_vegan': True, 'image_url': 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg', 'common_allergens': []},
            
            # Dairy
            {'name': 'Milk', 'category': 'dairy', 'calories_per_100g': 42, 'protein_per_100g': 3.4, 'carbs_per_100g': 5, 'fat_per_100g': 1, 'fiber_per_100g': 0, 'is_vegetarian': True, 'is_vegan': False, 'image_url': 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg', 'common_allergens': ['dairy']},
            {'name': 'Cheese', 'category': 'dairy', 'calories_per_100g': 402, 'protein_per_100g': 25, 'carbs_per_100g': 1.3, 'fat_per_100g': 33, 'fiber_per_100g': 0, 'is_vegetarian': True, 'is_vegan': False, 'image_url': 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg', 'common_allergens': ['dairy']},
        ]
        
        created_count = 0
        for ing_data in ingredients_data:
            ingredient, created = Ingredient.objects.get_or_create(
                name=ing_data['name'],
                defaults=ing_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {ingredient.name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully loaded {created_count} new ingredients!'))
        self.stdout.write(f'Total ingredients in database: {Ingredient.objects.count()}')
