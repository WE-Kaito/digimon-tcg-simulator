FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS development

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM dependencies AS build

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
