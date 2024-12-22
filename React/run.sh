#!/bin/bash

# =============================================================================
# Script Name: create-react-blank.sh
# Description: Automates the creation of a new React app with a blank page.
# Usage: ./create-react-blank.sh <app-name>
# =============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display usage instructions
usage() {
    echo "Usage: $0 <app-name>"
    echo "Example: $0 my-react-app"
    exit 1
}

# Check if the app name is provided
if [ -z "$1" ]; then
    echo "Error: App name not provided."
    usage
fi

APP_NAME=$1

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install Node.js and npm before running this script."
    exit 1
fi

if ! command -v npx &> /dev/null
then
    echo "Error: npx is not installed. Please install npm to use npx."
    exit 1
fi

# Create React app using Create React App
echo "🛠️  Creating a new React app named '$APP_NAME'..."
npx create-react-app "$APP_NAME"

# Navigate into the app directory
cd "$APP_NAME"

# Modify App.js to render a blank page
echo "📝 Modifying App.js to render a blank page..."
cat > src/App.js <<EOL
import React from 'react';

function App() {
  return (
    <div></div>
  );
}

export default App;
EOL

# Optionally, remove or modify other default files as needed
# For example, to remove the default logo and related imports, you can uncomment the following lines:

# echo "🗑️  Removing default logo and related imports..."
# rm src/logo.svg
# sed -i '/logo.svg/d' src/App.js
# sed -i '/import logo from/d' src/App.js

# Provide final instructions to the user
echo "✅ React app '$APP_NAME' has been created with a blank page."
echo "🚀 To get started, run the following commands:"
echo "   cd $APP_NAME"
echo "   npm start"

