from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from datetime import datetime
import pymongo
import os
from dotenv import load_dotenv
import re
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection - with fallback to local storage if MongoDB fails
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
use_local_storage = False
mongo_client = None
db = None
history_collection = None
feedback_collection = None

# Try to connect to MongoDB
try:
    mongo_client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Verify connection works
    mongo_client.server_info()
    db = mongo_client.text_analysis
    history_collection = db.history
    feedback_collection = db.feedback
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Warning: MongoDB connection failed: {e}")
    print("Using local file storage instead")
    use_local_storage = True
    
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)

# Local storage functions (fallback when MongoDB is unavailable)
def save_to_local_storage(data, collection_name):
    """Save data to local JSON file if MongoDB is unavailable"""
    file_path = f"data/{collection_name}.json"
    
    # Load existing data
    existing_data = []
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as f:
                existing_data = json.load(f)
        except:
            existing_data = []
    
    # Add new data
    existing_data.append(data)
    
    # Save data
    with open(file_path, 'w') as f:
        json.dump(existing_data, f, default=str)

def get_from_local_storage(collection_name):
    """Get data from local JSON file if MongoDB is unavailable"""
    file_path = f"data/{collection_name}.json"
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def clear_local_storage(collection_name):
    """Clear local JSON file if MongoDB is unavailable"""
    file_path = f"data/{collection_name}.json"
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'w') as f:
                json.dump([], f)
            return True
        except:
            return False
    return False

# Initialize the classifier
try:
    classifier = pipeline("text-classification", model="unitary/toxic-bert")
    print("BERT model loaded successfully!")
except Exception as e:
    print(f"Error loading BERT model: {e}")
    # Fallback to a simple classifier based on keyword matching
    class SimpleClassifier:
        def __call__(self, text):
            toxic_words = ["hate", "kill", "die", "idiot", "stupid", "dumb"]
            text_lower = text.lower()
            
            # Check if text contains toxic words
            has_toxic = any(word in text_lower for word in toxic_words)
            
            if has_toxic:
                return [{"label": "toxic", "score": 0.9}]
            else:
                return [{"label": "neutral", "score": 0.9}]
    
    classifier = SimpleClassifier()
    print("Using fallback simple classifier")

# Toxic words list for highlighting
TOXIC_WORDS = [
    "hate", "kill", "die", "idiot", "stupid", "dumb", 
    "fool", "moron", "ugly", "disgusting", "terrible",
    "awful", "horrible", "worst", "bad", "useless"
]

@app.route('/api/content/classify', methods=['POST'])
def classify_text():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Perform classification
        result = classifier(text)[0]
        confidence = result['score']
        
        # Find toxic words in the text
        toxic_words = []
        for word in TOXIC_WORDS:
            if re.search(r'\b' + re.escape(word) + r'\b', text.lower()):
                toxic_words.append(word)
        
        # Determine classification
        classification = 'neutral'
        if confidence > 0.7 or toxic_words:
            classification = 'toxic'
        elif confidence > 0.4:
            classification = 'offensive'
        
        # Create response
        response = {
            'text': text,
            'classification': classification,
            'confidence': confidence,
            'toxic_words': toxic_words
        }
        
        # Store in history
        history_entry = {
            **response,
            'timestamp': datetime.utcnow()
        }
        
        if use_local_storage:
            save_to_local_storage(history_entry, "history")
        else:
            history_collection.insert_one(history_entry)
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in classification: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/classify-file', methods=['POST'])
def classify_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and (file.filename.endswith('.txt') or file.filename.endswith('.csv')):
            content = file.read().decode('utf-8')
            
            # Split content into lines
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            
            results = []
            for line in lines:
                # Classify each line
                result = classifier(line)[0]
                confidence = result['score']
                
                # Find toxic words
                toxic_words = []
                for word in TOXIC_WORDS:
                    if re.search(r'\b' + re.escape(word) + r'\b', line.lower()):
                        toxic_words.append(word)
                
                # Determine classification
                classification = 'neutral'
                if confidence > 0.7 or toxic_words:
                    classification = 'toxic'
                elif confidence > 0.4:
                    classification = 'offensive'
                
                # Add to results
                results.append({
                    'text': line,
                    'classification': classification,
                    'confidence': confidence,
                    'toxic_words': toxic_words
                })
                
                # Store in history
                history_entry = {
                    'text': line,
                    'classification': classification,
                    'confidence': confidence,
                    'toxic_words': toxic_words,
                    'timestamp': datetime.utcnow(),
                    'source': 'file'
                }
                
                if use_local_storage:
                    save_to_local_storage(history_entry, "history")
                else:
                    history_collection.insert_one(history_entry)
            
            return jsonify({
                'results': results,
                'total': len(results)
            })
        
        return jsonify({"error": "Invalid file type. Only .txt and .csv files are allowed"}), 400
    
    except Exception as e:
        print(f"Error in file classification: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        
        if not data or not data.get('originalText') or not data.get('correctClassification'):
            return jsonify({"error": "Invalid feedback data"}), 400
        
        # Store feedback
        feedback_collection.insert_one({
            'original_text': data.get('originalText'),
            'original_classification': data.get('originalClassification'),
            'correct_classification': data.get('correctClassification'),
            'comment': data.get('comment', ''),
            'timestamp': datetime.utcnow()
        })
        
        return jsonify({"message": "Feedback submitted successfully"})
    
    except Exception as e:
        print(f"Error submitting feedback: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/history', methods=['GET'])
def get_history():
    try:
        if use_local_storage:
            entries = get_from_local_storage("history")
            # Sort by timestamp (newest first)
            entries.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        else:
            # Get history entries, sorted by timestamp (newest first)
            entries = list(history_collection.find({}, {'_id': 0}).sort('timestamp', -1))
        
        return jsonify(entries)
    
    except Exception as e:
        print(f"Error getting history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/clear-history', methods=['DELETE'])
def clear_history():
    try:
        if use_local_storage:
            success = clear_local_storage("history")
            deleted_count = 0 if success else "unknown"
        else:
            result = history_collection.delete_many({})
            deleted_count = result.deleted_count
        
        return jsonify({
            "message": "History cleared successfully",
            "deleted_count": deleted_count
        })
    
    except Exception as e:
        print(f"Error clearing history: {e}")
        return jsonify({"error": str(e)}), 500

# Simple route to test if the server is running
@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "running",
        "message": "Content moderation API is running",
        "storage_mode": "local file" if use_local_storage else "MongoDB",
        "endpoints": [
            "/api/content/classify",
            "/api/content/history",
            "/api/content/clear-history"
        ]
    })

if __name__ == '__main__':
    print("Starting content moderation server...")
    print(f"Storage mode: {'Local file storage' if use_local_storage else 'MongoDB'}")
    
    # Insert a test entry to verify storage works
    try:
        test_entry = {
            'text': 'This is a test entry',
            'classification': 'neutral',
            'confidence': 0.95,
            'toxic_words': [],
            'timestamp': datetime.utcnow()
        }
        
        if use_local_storage:
            save_to_local_storage(test_entry, "history")
            print("Test entry saved to local storage")
        else:
            history_collection.insert_one(test_entry)
            print("Test entry saved to MongoDB")
    except Exception as e:
        print(f"Error inserting test entry: {e}")
    
    app.run(debug=True, port=5000) 