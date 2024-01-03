# Utiliser l'image officielle Node.js comme image de base
FROM node:14

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Installer Express et MySQL dans le conteneur
RUN npm init -y
RUN npm install express mysql
RUN npm install cors


# Copier tous les fichiers du projet dans le répertoire de travail
COPY . .

# Exposer le port sur lequel l'application Express s'exécute
EXPOSE 3000

# Commande pour démarrer l'application Express
CMD ["node", "server.js"]
