# Utilisez une image Node.js comme image de base
FROM node:18-alpine

# Créez le répertoire de travail
WORKDIR /app

# Copiez les fichiers package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers de l'application
COPY . .

# Exposez le port 3000
EXPOSE 3000

# Démarrez l'application
CMD ["sh", "-c", "node deploy-commands.js && node index.js"]