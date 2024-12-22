#!/usr/bin/env python3

import os
import sys
import logging
import re
import subprocess
from pathlib import Path
import google.generativeai as genai
import time
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Load Gemini API Key from environment variable for security
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("Gemini API key is not set. Please set the GEMINI_API_KEY environment variable.")
    sys.exit(1)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Single directory for all generated code
APP_DIR = Path("app")

# Ensure the directory exists
APP_DIR.mkdir(parents=True, exist_ok=True)
logger.info(f"Directory set: {APP_DIR.resolve()}")

def save_js_file(directory: Path, file_name: str, js_code: str):
    """Save JavaScript code to a file in the specified directory."""
    file_path = directory / f"{file_name}.js"
    try:
        with open(file_path, 'w') as file:
            file.write(js_code)
        logger.info(f"File saved: {file_path}")
    except Exception as e:
        logger.error(f"Failed to save {file_name}.js: {e}")

def extract_model_name(js_code: str) -> str:
    """Extract the model name from the JavaScript code using regex."""
    match = re.search(r"mongoose\.model\(['\"](\w+)['\"],", js_code)
    return match.group(1) if match else "Model"

def extract_code(response_text: str) -> str:
    """
    Extract JavaScript code from the Gemini API response.
    
    Looks for code enclosed in triple backticks. If not found, tries to extract code lines.
    If still not found, returns the entire response assuming it's code.
    """
    # Look for code blocks enclosed in triple backticks
    code_block = re.search(r"```(?:javascript)?\s*([\s\S]+?)\s*```", response_text, re.IGNORECASE)
    if code_block:
        return code_block.group(1).strip()
    else:
        # Attempt to extract lines that look like code
        code_lines = re.findall(r"```(?:javascript)?\s*([\s\S]+?)\s*```", response_text, re.IGNORECASE)
        if code_lines:
            return "\n".join(code_lines).strip()
        else:
            # Assume entire response is code
            return response_text.strip()

def generate_blueprint(description: str, component_type: str) -> str:
    """
    Use Gemini to generate a detailed textual blueprint for the specified component.
    
    :param description: Description of the component.
    :param component_type: 'Model', 'Controller', or 'Route'.
    :return: Blueprint as a string.
    """
    if component_type.lower() == "model":
        prompt = (
            f"Provide a concise blueprint for a Mongoose model based on the following description:\n"
            f"Description: {description}\n\n"
            f"Include the model name, fields with MongoDB-compatible data types, and necessary validations."
        )
    elif component_type.lower() == "controller":
        prompt = (
            f"Provide a concise blueprint for an Express.js controller based on the following model description:\n"
            f"Description: {description}\n\n"
            f"Include essential CRUD methods and any additional functions crucial for core features."
        )
    elif component_type.lower() == "route":
        prompt = (
            f"Provide a concise blueprint for Express.js routes based on the following controller description:\n"
            f"Description: {description}\n\n"
            f"Include necessary endpoints and HTTP methods."
        )
    elif component_type.lower() == "app":
        prompt = (
            f"Provide a concise blueprint for a simple Node.js Express application to test the following routes:\n"
            f"Description: {description}\n\n"
            f"Include necessary middleware and server setup."
        )
    else:
        logger.error(f"Unsupported component type: {component_type}")
        return ""
    
    model_name = "gemini-1.5-flash"
    max_retries = 5
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            blueprint_raw = response.text.strip() if response and response.text else None
            if blueprint_raw:
                blueprint = blueprint_raw  # No extra text expected in blueprint
                logger.info(f"{component_type} blueprint generated.")
                return blueprint
            else:
                logger.error(f"Failed to generate {component_type} blueprint.")
                return ""
        except Exception as e:
            error_message = str(e)
            if "is currently loading" in error_message.lower() or "Model too busy" in error_message:
                # Extract estimated_time from the error message if available
                estimated_time = 20  # Default wait time
                try:
                    # Attempt to parse estimated_time from the error message
                    error_json = json.loads(error_message)
                    estimated_time = error_json.get("estimated_time", 20)
                except:
                    pass
                logger.warning(f"Model is busy/loading. Retrying in {estimated_time} seconds...")
                time.sleep(estimated_time)
            else:
                logger.error(f"Gemini API error for {component_type}: {e}")
                break
    logger.error(f"Failed to generate {component_type} blueprint after {max_retries} attempts.")
    return ""

def implement_blueprint(blueprint: str, component_type: str) -> str:
    """
    Use Gemini to implement the specified component based on the blueprint.
    
    :param blueprint: Blueprint text.
    :param component_type: 'Model', 'Controller', 'Route', or 'App'.
    :return: JavaScript code as a string.
    """
    user_prompt = (
        f"Blueprint:\n{blueprint}\n\n"
        f"Provide ONLY the JavaScript code for the {component_type} based on this blueprint. "
        "Enclose the code within triple backticks and specify 'javascript' for syntax highlighting. "
        "Do NOT include any explanations, comments, or additional text."
    )
    
    model_name = "gemini-1.5-flash"
    max_retries = 5
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(user_prompt)
            response_text = response.text.strip()
            code = extract_code(response_text)
            if code:
                logger.info(f"{component_type} implemented.")
                return code
            else:
                logger.error(f"Failed to implement {component_type}.")
                return ""
        except Exception as e:
            error_message = str(e)
            if "is currently loading" in error_message.lower() or "Model too busy" in error_message:
                # Extract estimated_time from the error message if available
                estimated_time = 20  # Default wait time
                try:
                    # Attempt to parse estimated_time from the error message
                    error_json = json.loads(error_message)
                    estimated_time = error_json.get("estimated_time", 20)
                except:
                    pass
                logger.warning(f"Model is busy/loading. Retrying in {estimated_time} seconds...")
                time.sleep(estimated_time)
            else:
                logger.error(f"Gemini API error for {component_type}: {e}")
                break
    logger.error(f"Failed to implement {component_type} after {max_retries} attempts.")
    return ""

def verify_js_syntax(js_code: str) -> bool:
    """Verify JavaScript syntax using Node.js."""
    try:
        temp_file = APP_DIR / "temp_code.js"
        with open(temp_file, 'w') as file:
            file.write(js_code)
        
        result = subprocess.run(["node", "--check", str(temp_file)], capture_output=True, text=True)
        temp_file.unlink()
        
        if result.returncode == 0:
            logger.info("JavaScript syntax is correct.")
            return True
        else:
            logger.error(f"Syntax Error:\n{result.stderr}")
            return False
    except FileNotFoundError:
        logger.error("Node.js not installed. Skipping syntax verification.")
        return True
    except Exception as e:
        logger.error(f"Syntax verification error: {e}")
        return False

def create_package_json():
    """Create a package.json file with necessary dependencies and scripts."""
    package_json_path = APP_DIR / "package.json"
    if package_json_path.exists():
        logger.info("package.json already exists.")
        return
    
    package_data = {
        "name": "generated-app",
        "version": "1.0.0",
        "description": "A Node.js Express application generated automatically.",
        "main": "app.js",
        "scripts": {
            "start": "node app.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^7.0.4",
            "body-parser": "^1.20.2"
        }
    }
    
    try:
        with open(package_json_path, 'w') as file:
            json.dump(package_data, file, indent=4)
        logger.info(f"package.json created at {package_json_path}")
        
        # Run npm install automatically
        logger.info("Installing dependencies...")
        result = subprocess.run(["npm", "install"], cwd=APP_DIR, capture_output=True, text=True)
        if result.returncode == 0:
            logger.info("Dependencies installed successfully.")
        else:
            logger.error(f"Failed to install dependencies:\n{result.stderr}")
    except Exception as e:
        logger.error(f"Failed to create package.json: {e}")

def create_simple_node_app():
    """Create a simple Node.js Express app to test the generated routes."""
    app_file = APP_DIR / "app.js"
    try:
        app_code = f"""
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {extract_model_name_from_file()}Routes = require('./{extract_model_name_from_file()}Routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/{extract_model_name_from_file().lower()}s', {extract_model_name_from_file()}Routes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/{extract_model_name_from_file().lower()}app', {{ useNewUrlParser: true, useUnifiedTopology: true }})
    .then(() => {{
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }})
    .catch(err => console.error('MongoDB connection error:', err));
        """.strip()
        with open(app_file, 'w') as file:
            file.write(app_code)
        logger.info(f"Node.js app.js created at {app_file}")
    except Exception as e:
        logger.error(f"Failed to create app.js: {e}")

def extract_model_name_from_file() -> str:
    """Extract model name from the saved model file."""
    model_files = list(APP_DIR.glob("*.js"))
    for file in model_files:
        with open(file, 'r') as f:
            content = f.read()
            match = re.search(r"mongoose\.model\(['\"](\w+)['\"],", content)
            if match:
                return match.group(1)
    return "Model"

def main():
    print("Enter a description for your Mongoose model (e.g., 'a User model with name, email, and password fields'), or type 'exit' to quit:")
    while True:
        try:
            user_input = input("Description: ").strip()
        except KeyboardInterrupt:
            print("\nExiting.")
            break

        if user_input.lower() == 'exit':
            print("Exiting.")
            break
        
        if not user_input:
            print("Invalid input. Try again.")
            continue
        
        # Generate and implement Model
        model_blueprint = generate_blueprint(user_input, "Model")
        if not model_blueprint:
            continue
        model_code = implement_blueprint(model_blueprint, "Model")
        if not model_code:
            continue
        if not verify_js_syntax(model_code):
            continue
        print("\nGenerated Mongoose Model Code:\n")
        print(model_code)
        accept = input("\nAccept and save this model? (yes/no): ").strip().lower()
        if accept != 'yes':
            print("Model not saved.")
            continue
        model_name = extract_model_name(model_code)
        save_js_file(APP_DIR, model_name, model_code)
        
        # Generate and implement Controller
        controller_description = f"Controller for the {model_name} model."
        controller_blueprint = generate_blueprint(controller_description, "Controller")
        if not controller_blueprint:
            continue
        controller_code = implement_blueprint(controller_blueprint, "Controller")
        if not controller_code:
            continue
        if not verify_js_syntax(controller_code):
            continue
        print("\nGenerated Controller Code:\n")
        print(controller_code)
        accept = input("\nAccept and save this controller? (yes/no): ").strip().lower()
        if accept != 'yes':
            print("Controller not saved.")
            continue
        controller_name = f"{model_name}Controller"
        save_js_file(APP_DIR, controller_name, controller_code)
        
        # Generate and implement Routes
        route_description = f"Routes for the {controller_name}."
        route_blueprint = generate_blueprint(route_description, "Route")
        if not route_blueprint:
            continue
        route_code = implement_blueprint(route_blueprint, "Route")
        if not route_code:
            continue
        if not verify_js_syntax(route_code):
            continue
        print("\nGenerated Routes Code:\n")
        print(route_code)
        accept = input("\nAccept and save these routes? (yes/no): ").strip().lower()
        if accept != 'yes':
            print("Routes not saved.")
            continue
        route_name = f"{model_name}Routes"
        save_js_file(APP_DIR, route_name, route_code)
        
        # Create package.json and install dependencies
        create_package_json()
        
        # Create Node.js app.js
        create_simple_node_app()
        
        print("\nAll components generated and saved successfully.\n")

if __name__ == "__main__":
    main()
