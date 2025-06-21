from django.test import TestCase
from django.contrib.auth import get_user_model
from planning_app.models import Planning
from exchanges.models import DemandeEchange

class EchangeTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.demandeur = User.objects.create_user(
            email='demandeur@test.com',
            password='pass',
            username='demandeur'
        )
        self.destinataire = User.objects.create_user(
            email='destinataire@test.com',
            password='pass',
            username='destinataire'
        )

        self.planning1 = Planning.objects.create(
            agent=self.demandeur,
            date='2025-06-24',
            type_service='matin'
        )
        self.planning2 = Planning.objects.create(
            agent=self.destinataire,
            date='2025-06-25',
            type_service='nuit'
        )

    def test_creation_echange(self):
        echange = DemandeEchange.objects.create(
            planning_demandeur=self.planning1,
            planning_destinataire=self.planning2,
            demandeur=self.demandeur,
            destinataire=self.destinataire,
            message_demandeur="Échange souhaité pour convenance personnelle",
            statut='en_attente'
        )
        self.assertEqual(echange.statut, 'en_attente')
        self.assertEqual(echange.demandeur.email, 'demandeur@test.com')


from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token

class AuthentificationTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='agent@example.com',
            password='testpassword',
            username='testuser'
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_acces_planning(self):
        response = self.client.get('/api/plannings/')
        self.assertEqual(response.status_code, 200)

