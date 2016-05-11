FROM node:6-slim

# Install all deps
WORKDIR /work

# Copy all code
COPY package.json ./
RUN npm install
COPY . .

ENTRYPOINT ["node"]
