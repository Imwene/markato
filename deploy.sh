#!/bin/bash

# Exit on any error
set -e

echo "🏗️  Building client..."
cd Client && bun run build:production && cd ..

echo "📦 Syncing client files..."
rsync -av --delete Client/dist/ deployment/dist/

echo "📦 Syncing server files (excluding node_modules and bun.lockb)..."
rsync -av --exclude='node_modules' --exclude='bun.lockb' --exclude='package-lock.json' --exclude='.env' --exclude='.env.production' Server/ deployment/

echo "📁 Creating deployment tarball..."
tar -czf deployment.tar.gz deployment/

echo "🚀 Uploading to server..."
scp -i '/Users/meharidaniel/.ssh/markato.pem' deployment.tar.gz ubuntu@ec2-54-183-7-8.us-west-1.compute.amazonaws.com:/home/ubuntu
