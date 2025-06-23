# Utilise une image Python légère
FROM python:3.12-slim

# Crée le dossier de travail
WORKDIR /app/backend

# Copie les dépendances en premier
COPY requirements.txt ./

# Installation des dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copie tout le reste du projet
COPY . .

# Expose le port 8000 (par défaut pour Django)
EXPOSE 8000

# Commande pour démarrer le serveur Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
