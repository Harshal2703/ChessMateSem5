# Use an official Node.js runtime as the base image
FROM node:18.12.1

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the Next.js build folder and other necessary files to the container
COPY . .

# Build your Next.js application
RUN npm run build

# Expose the port that your Next.js application will listen on
EXPOSE 3000

# Start your Next.js application with the 'npm run start' command
CMD [ "npm", "run", "start" ]
