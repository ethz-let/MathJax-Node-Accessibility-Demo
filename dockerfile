#------------------------------
# Specify a base image
#------------------------------
FROM node:alpine
MAINTAINER Faithful <martin.hanusch@id.ethz.ch>

#------------------------------
# Install curl
#------------------------------
RUN apk update && apk add curl curl-dev bash

#------------------------------
# Define workdir
#------------------------------
RUN mkdir -p /app
WORKDIR /app

#------------------------------
# Create non-root user for security
#------------------------------
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

#------------------------------
# Copy files
#------------------------------
COPY package-lock.json package.json /app
COPY server.js ./
COPY modules ./modules
COPY test ./test
COPY logs ./logs

#------------------------------
# Set environment for SRE and Production
#------------------------------
ENV NODE_ENV=production

#------------------------------
# Build Node Application
#------------------------------
RUN npm install

#------------------------------
# Set proper ownership
#------------------------------
RUN chown -R nodejs:nodejs /app

#------------------------------
# Switch to non-root user
#------------------------------
USER nodejs

EXPOSE 3000
ENTRYPOINT ["node", "server.js"]
