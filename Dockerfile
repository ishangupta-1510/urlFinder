# 1. Use official Node.js image
FROM node:20

# 2. Set working directory
WORKDIR /app

# 3. Copy only package.json and package-lock.json (better for caching)
COPY package*.json /app/

# 4. Install Node dependencies
RUN npm install

# 5. Install system dependencies for Playwright
RUN apt-get update && apt-get install -y wget libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 libgbm-dev libxshmfence-dev libxcomposite1 libxrandr2 xdg-utils

# 6. Install Playwright browsers (Chromium, Firefox, WebKit)
RUN npx playwright install --with-deps

# 7. Copy rest of your app code
COPY . .

# 8. Build TypeScript project
RUN npm run build

# 9. Expose app port
EXPOSE 3000

# 10. Command to run your app
CMD ["npm", "start"]
