# Use an official node image as the base image
FROM node:22-alpine

ENV VITE_API_URL="http://localhost:8000"

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN yarn

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["yarn", "preview"]
