import random
from datetime import timedelta, date
from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from planning_app.models import Planning


def daterange(start_date, end_date):
    """Génère les dates entre deux dates"""
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)


class Command(BaseCommand):
    help = "Génère des plannings fictifs pour les agents existants"

    def handle(self, *args, **options):
        users = CustomUser.objects.all()
        start_date = date(2025, 3, 1)
        end_date = date(2025, 6, 30)

        # Liste des postes possibles
        postes = ['QPC', 'POSTE 1', 'POSTE 2', 'POSTE 3', 'RENFORT']


        for user in users:
            self.stdout.write(f"🛠️ Génération pour {user.full_name}")
            for day in daterange(start_date, end_date):
                # Empêche les doublons
                if not Planning.objects.filter(agent=user, date=day).exists():
                    type_service = random.choices(
                        list(Planning.HORAIRES_PREDEFINIS.keys()),
                        weights=[20, 20, 10, 10, 20, 10, 10],
                        k=1
                    )[0]

                    # Poste uniquement si c’est un jour travaillé
                    poste = random.choice(postes) if type_service not in ['repos', 'vacances', 'jour_ferie_repos'] else None

                    Planning.objects.create(
                        agent=user,
                        date=day,
                        type_service=type_service,
                        poste=poste,
                        notes="Généré automatiquement",
                        created_by=user,
                        updated_by=user
                    )

        self.stdout.write(self.style.SUCCESS("✅ Plannings générés avec succès avec les postes."))


