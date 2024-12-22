#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to display informational messages
echo_info() {
    echo -e "\033[1;34m$1\033[0m"
}

# Function to display success messages
echo_success() {
    echo -e "\033[1;32m$1\033[0m"
}

# Function to display error messages
echo_error() {
    echo -e "\033[1;31m$1\033[0m"
}

# Function to URL-encode strings
url_encode() {
    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:i:1}"
        case $c in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done
}

# Function to check if a string contains characters that need to be URL-encoded
needs_encoding() {
    [[ "$1" =~ [^a-zA-Z0-9.~_-] ]]
}

# Function to check if a string is already URL-encoded
is_url_encoded() {
    [[ "$1" =~ (%[0-9A-Fa-f]{2})+ ]]
}

# Prompt user for input with default values
read -p "Enter the project directory name [backend]: " PROJECT_DIR
PROJECT_DIR=${PROJECT_DIR:-backend}

read -p "Enter your MongoDB connection string: " MONGO_URI

# Validate MongoDB URI
if [[ -z "$MONGO_URI" ]]; then
    echo_error "MongoDB connection string cannot be empty. Please run the script again and provide a valid URI."
    exit 1
fi

# Remove angle brackets if present
MONGO_URI=$(echo "$MONGO_URI" | sed 's/[<>]//g')

# Check if the connection string starts with mongodb+srv://
if [[ "$MONGO_URI" != mongodb+srv://* ]]; then
    echo_error "Invalid connection string format. Please ensure it starts with 'mongodb+srv://'."
    exit 1
fi

# Ensure no port number is specified in mongodb+srv URI
# mongodb+srv URIs should not contain port numbers
if echo "$MONGO_URI" | grep -q ":.*@"; then
    # Check if there is a colon after the @ symbol indicating a port
    PORT_CHECK=$(echo "$MONGO_URI" | grep -o "@[^:/]*:[0-9]*" || true)
    if [[ -n "$PORT_CHECK" ]]; then
        echo_error "mongodb+srv URI should not contain a port number. Please remove the port from your connection string."
        exit 1
    fi
fi

# Extract password from the connection string
# Assuming the connection string is in the format: mongodb+srv://username:password@cluster0.mongodb.net/dbname?options
PASSWORD=$(echo "$MONGO_URI" | sed -E 's|mongodb\+srv://[^:]+:([^@]+)@.*|\1|')

# Check if password needs encoding
if needs_encoding "$PASSWORD"; then
    # Check if the password is already URL-encoded
    if is_url_encoded "$PASSWORD"; then
        echo_info "Your MongoDB password appears to be already URL-encoded."
    else
        echo_info "Your MongoDB password contains special characters that need to be URL-encoded."
        # URL-encode the password
        ENCODED_PASS=$(url_encode "$PASSWORD")
        # Replace the password in the connection string with the encoded password
        MONGO_URI_ENCODED=$(echo "$MONGO_URI" | sed -E "s|mongodb\+srv://([^:]+):[^@]+@|mongodb+srv://\1:$ENCODED_PASS@|")
        MONGO_URI="$MONGO_URI_ENCODED"
        echo_success "Password URL-encoded successfully."
    fi
else
    echo_info "No URL-encoding needed for your MongoDB password."
fi

read -p "Enter the port number [5000]: " PORT
PORT=${PORT:-5000}

# Display starting message
echo_info "Starting backend setup..."

# Create project directory
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Initialize Node.js project
echo_info "Initializing Node.js project..."
npm init -y

# Install dependencies
echo_info "Installing dependencies: express, mongoose, dotenv, cors..."
npm install express mongoose dotenv cors

# Install development dependencies
echo_info "Installing development dependencies: nodemon..."
npm install --save-dev nodemon

# Create folder structure
echo_info "Creating folder structure: config, controllers, models, routes..."
mkdir -p config controllers models routes

# Create .env file with user-provided details
echo_info "Creating .env file..."
cat <<EOL > .env
PORT=$PORT
MONGO_URI=$MONGO_URI
EOL

# Create .gitignore file
echo_info "Creating .gitignore..."
cat <<EOL > .gitignore
# Node modules
node_modules/

# Environment variables
.env

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# Build directories
/build
/dist
EOL

# Create config/db.js with MongoDB connection setup
echo_info "Creating config/db.js..."
cat <<EOL > config/db.js
// config/db.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
EOL

# Create server.js with basic Express setup
echo_info "Creating server.js..."
cat <<EOL > server.js
// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes (to be added later)
// app.use('/api/items', require('./routes/itemRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
EOL

# Create empty .gitkeep files in controllers, models, and routes directories
echo_info "Creating empty .gitkeep files in controllers, models, and routes directories..."
touch controllers/.gitkeep
touch models/.gitkeep
touch routes/.gitkeep

# Update package.json scripts
echo_info "Configuring npm scripts in package.json..."

# Check if jq is installed; install if not
if ! command -v jq &> /dev/null
then
    echo_info "jq not found. Installing jq to update package.json scripts..."
    sudo apt-get update
    sudo apt-get install -y jq
fi

# Safely update package.json scripts using jq
jq '.scripts.start = "node server.js" | .scripts.dev = "nodemon server.js"' package.json > tmp.$$.json && mv tmp.$$.json package.json

# Initialize Git repository (optional)
read -p "Do you want to initialize a Git repository and make the initial commit? (y/n) [y]: " INIT_GIT
INIT_GIT=${INIT_GIT:-y}

if [[ "$INIT_GIT" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo_info "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial backend setup"
    echo_success "Git repository initialized and initial commit made."
else
    echo_info "Skipping Git initialization."
fi

# Test MongoDB connection
echo_info "Testing MongoDB connection..."

# Create a temporary Node.js script to test the connection
cat <<'EOF' > test-connection.js
const connectDB = require('./config/db');

connectDB()
    .then(() => {
        console.log('Connection test successful.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Connection test failed:', err.message);
        process.exit(1);
    });
EOF

# Run the connection test
node test-connection.js

# Capture the exit status
CONN_STATUS=$?

# Remove the temporary test script
rm test-connection.js

# Check the exit status of the connection test
if [ $CONN_STATUS -eq 0 ]; then
    echo_success "MongoDB connection verified successfully."
else
    echo_error "MongoDB connection failed. Please check your connection details and try again."
    exit 1
fi

# Display completion message
echo_success "Backend setup complete!"

# Display next steps
echo_info "Next Steps:"
echo_info "1. Navigate to the backend directory (if not already there):"
echo_info "   cd $PROJECT_DIR"
echo_info "2. Define your models, controllers, and routes as needed."
echo_info "3. Start the server in development mode:"
echo_info "   npm run dev"



please add this to the script include this please in env-

JWT_SECRET=your_secret_key
BASE_URL=http://localhost:3000
EMAIL_USER=kamogelomosiah@gmail.com
EMAIL_PASS=#Sixmillionby26$