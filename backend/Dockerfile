FROM node:18

WORKDIR /app

COPY package*.json ./
COPY src/prisma/schema.prisma ./src/prisma/
RUN npm install

# gen prisma client
RUN npx prisma generate --schema=src/prisma/schema.prisma

COPY . .

# env
ENV DATABASE_URL="postgresql://postgres:password@db:5432/postgres"

# migrate the database is imp
CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && npm run dev"]
