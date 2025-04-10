# Installation Guide

This guide provides step-by-step instructions for setting up the Sensitive Content Moderation System on different platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Windows Installation](#windows-installation)
3. [macOS Installation](#macos-installation)
4. [Linux Installation](#linux-installation)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing, ensure you have the following:
- Git
- Python 3.8 or higher
- Node.js 14.x or higher
- npm 6.x or higher
- (Optional) MongoDB

## Windows Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/Sensitive-Content-Moderation-System.git
cd Sensitive-Content-Moderation-System
```

### 2. Set Up Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

If you encounter issues with the `transformers` library installation, you can try:
```bash
pip install torch
pip install transformers --no-deps
pip install emoji
```

### 3. Set Up Frontend
```bash
cd ..\frontend
npm install
```

### 4. Configure Environment Variables
Create `.env` files in both frontend and backend directories:

**backend/.env**:
```
# Server Configuration
PORT=5000

# MongoDB Connection String (optional)
MONGODB_URI=mongodb://localhost:27017/

# HuggingFace API Key (optional)
HUGGINGFACE_API_KEY=your_key_here
```

**frontend/.env**:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Run the Application
Start the backend:
```bash
cd ..\backend
python app.py
```

In a new terminal window, start the frontend:
```bash
cd frontend
npm start
```

The application should now be running at http://localhost:3000

## macOS/Linux Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/Sensitive-Content-Moderation-System.git
cd Sensitive-Content-Moderation-System
```

### 2. Set Up Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

If you encounter issues with the `transformers` library installation, you can try:
```bash
pip install torch
pip install transformers --no-deps
pip install emoji
```

### 3. Set Up Frontend
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables
Create `.env` files in both frontend and backend directories as shown in the Windows section.

### 5. Run the Application
Start the backend:
```bash
cd ../backend
python app.py
```

In a new terminal window, start the frontend:
```bash
cd frontend
npm start
```

The application should now be running at http://localhost:3000

## Troubleshooting

### MongoDB Connection Issues
The system will automatically fall back to local storage if MongoDB is not available. However, if you want to use MongoDB:

1. Ensure MongoDB is installed and running
2. Check your connection string in `backend/.env`
3. If using Atlas, verify your IP is whitelisted

### BERT Model Download Issues
On first run, the system will download the BERT model, which may take some time. If you encounter issues:

1. Check your internet connection
2. Ensure you have sufficient disk space
3. Try installing with `--no-cache-dir`: `pip install transformers --no-cache-dir`

### Python Package Conflicts
If you encounter package conflicts or incompatible dependencies:

1. Create a fresh virtual environment
2. Install packages one by one, starting with core dependencies
3. For Windows, ensure you have the appropriate Visual C++ Build Tools installed

### "Module Not Found" Errors
If you encounter "Module Not Found" errors when running the backend:

1. Ensure you've activated the virtual environment
2. Reinstall the missing package: `pip install package_name`
3. Verify the package is listed in requirements.txt 