from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from datetime import datetime
import pymongo
import os
from dotenv import load_dotenv
import re
import json
import time
import emoji

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

# Try to connect to MongoDB with retry mechanism
def try_mongodb_connection(max_retries=3, retry_delay=2):
    global mongo_client, db, history_collection, feedback_collection, use_local_storage
    for attempt in range(max_retries):
        try:
            print(f"Attempting MongoDB connection (attempt {attempt + 1}/{max_retries})...")
            mongo_client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Verify connection works
            mongo_client.server_info()
            db = mongo_client.text_analysis
            history_collection = db.history
            feedback_collection = db.feedback
            print("Connected to MongoDB successfully!")
            return True
        except Exception as e:
            print(f"MongoDB connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("All MongoDB connection attempts failed. Using local storage.")
    use_local_storage = True
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    return False

try_mongodb_connection()

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

# Expanded toxic words list including common negative emojis
TOXIC_WORDS = [
    # Original toxic words
    "hate", "kill", "die", "idiot", "stupid", "dumb", 
    "fool", "moron", "ugly", "disgusting", "terrible",
    "awful", "horrible", "worst", "bad", "useless",
    # Additional toxic/negative words 
    "pathetic", "loser", "jerk", "worthless", "trash", 
    "garbage", "sucks", "waste", "failure", "hate",
    "crap", "rubbish", "lame", "dumb", "screw",
    "suck", "wtf", "idiot", "damn", "shut up",
    "dumbass", "bitch", "asshole", "shit", "fuck", 
    "fuck you", "bastard", "retard", "retarded",
    # Common toxic emoji representations
    "💩", "🖕", "🤮", "😡", "🤬", "👎", "😠"
]

# Direct positive alternatives for specific negative phrases
DIRECT_POSITIVE_ALTERNATIVES = {
    # Appearance and intelligence
    "ugly": ["beautiful", "attractive", "good-looking", "stunning"],
    "stupid": ["intelligent", "smart", "brilliant", "clever"],
    "idiot": ["genius", "intelligent person", "smart individual"],
    "dumb": ["wise", "knowledgeable", "insightful"],
    "fat": ["healthy", "wonderful", "great"],
    "skinny": ["fit", "healthy", "well-proportioned"],
    # Value and worth
    "useless": ["valuable", "essential", "important", "helpful"],
    "worthless": ["precious", "valuable", "priceless", "important"],
    "waste": ["valuable use", "worthwhile investment", "good use"],
    "failure": ["success", "achiever", "accomplished"],
    "loser": ["winner", "champion", "achiever", "successful person"],
    # Personality and character
    "hate": ["appreciate", "value", "respect", "admire"],
    "pathetic": ["impressive", "remarkable", "extraordinary"],
    "jerk": ["kind person", "considerate individual", "thoughtful person"],
    "trash": ["treasure", "valuable", "precious"],
    "garbage": ["valuable", "quality", "excellent"],
    "sucks": ["excellent", "outstanding", "impressive"],
    # Comparisons and metaphors
    "donkey": ["intelligent person", "wonderful human", "clever individual"],
    "pig": ["neat person", "clean individual", "organized person"],
    "dog": ["loyal friend", "faithful companion", "devoted ally"],
    "rat": ["honorable person", "trustworthy individual", "reliable friend"],
    # Specific insults
    "moron": ["brilliant mind", "intelligent person", "smart individual"],
    "fool": ["wise person", "sensible individual", "intelligent thinker"],
    "disgusting": ["wonderful", "pleasant", "admirable"],
    "terrible": ["excellent", "outstanding", "impressive"],
    "awful": ["wonderful", "delightful", "pleasant"],
    "horrible": ["excellent", "magnificent", "superb"],
    "worst": ["best", "finest", "top-notch"],
    "bad": ["good", "excellent", "wonderful"]
}

# Positive generic compliments to add to messages
POSITIVE_COMPLIMENTS = [
    "You look beautiful/handsome today.",
    "Your intelligence shines through.",
    "You have such amazing qualities.",
    "You are incredibly talented.",
    "Your kindness is inspiring.",
    "You have a wonderful personality.",
    "Your perspective is valuable.",
    "You make a positive difference.",
    "You are doing great work.",
    "You deserve all the happiness in the world.",
    "You have a bright future ahead.",
    "Your presence brightens everyone's day.",
    "You are an incredible human being.",
    "Your ideas are brilliant.",
    "You are a source of inspiration to others."
]

# Positive suggestion mapping for toxic messages
POSITIVE_SUGGESTIONS = {
    'toxic': [
        "I understand your perspective, but could we discuss this more constructively?",
        "I respect your opinion, though I see things differently.",
        "I appreciate your feedback. Let's find a solution together.",
        "I'd like to understand your point of view better.",
        "I think we could find common ground on this.",
        "Thank you for sharing your thoughts. I'd like to share mine as well.",
        "Let's approach this conversation with mutual respect.",
        "I value open dialogue. Can we discuss this differently?",
        "I hear your concern. How can we address this together?",
        "I'm sorry you feel that way. Let's find a positive way forward."
    ],
    'offensive': [
        "I think we could phrase this more gently.",
        "Perhaps we could express this differently.",
        "Let's try to keep our conversation respectful.",
        "I appreciate your passion on this topic. Let's discuss it calmly.",
        "I respect your feelings. Let's find a middle ground."
    ]
}

def get_positive_suggestion(classification):
    """Return a positive alternative message based on classification"""
    import random
    if classification == 'neutral':
        return None
    suggestions = POSITIVE_SUGGESTIONS.get(classification, POSITIVE_SUGGESTIONS['toxic'])
    return random.choice(suggestions)

def remove_emojis(text):
    """Remove all emojis from text"""
    import re
    emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # emoticons
                               u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                               u"\U0001F680-\U0001F6FF"  # transport & map symbols
                               u"\U0001F700-\U0001F77F"  # alchemical symbols
                               u"\U0001F780-\U0001F7FF"  # Geometric Shapes
                               u"\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
                               u"\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
                               u"\U0001FA00-\U0001FA6F"  # Chess Symbols
                               u"\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
                               u"\U00002702-\U000027B0"  # Dingbats
                               u"\U000024C2-\U0001F251" 
                               "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)

def generate_direct_positive_alternative(text, toxic_words, remove_emoji=False):
    """Generate a direct positive alternative to a toxic message"""
    import random
    import re
    if not toxic_words:
        positive_message = random.choice(POSITIVE_COMPLIMENTS)
        return remove_emojis(positive_message) if remove_emoji else positive_message
    # Start with a blank message
    positive_message = text.lower()
    # Replace toxic words with positive alternatives
    for toxic_word in toxic_words:
        # Skip emoji toxic words for direct replacement
        if toxic_word in emoji.EMOJI_DATA:
            continue
        toxic_word_lower = toxic_word.lower()
        if toxic_word_lower in DIRECT_POSITIVE_ALTERNATIVES:
            # Get a random positive alternative for this toxic word
            positive_alternative = random.choice(DIRECT_POSITIVE_ALTERNATIVES[toxic_word_lower])
            # Replace the toxic word with the positive alternative
            # Using word boundaries to ensure we replace whole words
            positive_message = re.sub(r'\b' + re.escape(toxic_word_lower) + r'\b', 
                                     positive_alternative, 
                                     positive_message, 
                                     flags=re.IGNORECASE)
    # If the message hasn't changed much, add a generic compliment
    if positive_message.lower() == text.lower():
        positive_message = random.choice(POSITIVE_COMPLIMENTS)
    else:
        # Capitalize the first letter of the message
        positive_message = positive_message[0].upper() + positive_message[1:]
        # Add a period if there isn't one already
        if not any(positive_message.endswith(p) for p in [".", "!", "?"]):
            positive_message += "."
    # Remove emojis if requested
    if remove_emoji:
        positive_message = remove_emojis(positive_message)
    return positive_message

def contains_emoji(text):
    """Check if text contains any emoji"""
    return any(char in emoji.EMOJI_DATA for char in text)

def detect_toxic_emoji(text):
    """Detect toxic emojis in text"""
    toxic_emojis = []
    for char in text:
        if char in TOXIC_WORDS and char in emoji.EMOJI_DATA:
            toxic_emojis.append(char)
    return toxic_emojis

@app.route('/api/content/classify', methods=['POST'])
def classify_text():
    global use_local_storage
    try:
        data = request.json
        text = data.get('text', '')
        if not text:
            return jsonify({"error": "No text provided"}), 400
        # Perform classification
        result = classifier(text)[0]
        confidence = result['score']
        # Find toxic words in the text (including emojis)
        toxic_words = []
        for word in TOXIC_WORDS:
            if word in emoji.EMOJI_DATA:  # If it's an emoji
                if word in text:
                    toxic_words.append(word)
            else:  # If it's a regular word
                if re.search(r'\b' + re.escape(word) + r'\b', text.lower()):
                    toxic_words.append(word)
        # Check for emojis in general
        has_emoji = contains_emoji(text)
        toxic_emojis = detect_toxic_emoji(text)
        # Add detected toxic emojis to toxic words list
        for emoji_char in toxic_emojis:
            if emoji_char not in toxic_words:
                toxic_words.append(emoji_char)
        # Determine classification
        classification = 'neutral'
        if confidence > 0.7 or toxic_words:
            classification = 'toxic'
        elif confidence > 0.4:
            classification = 'offensive'
        # Get positive suggestion if message is toxic or offensive
        positive_suggestion = get_positive_suggestion(classification)
        # Generate direct positive alternative for toxic messages (keep emojis for direct text analysis)
        direct_positive_alternative = None
        if classification in ['toxic', 'offensive']:
            direct_positive_alternative = generate_direct_positive_alternative(text, toxic_words, remove_emoji=False)
        # Create response
        response = {
            'text': text,
            'classification': classification,
            'confidence': confidence,
            'toxic_words': toxic_words,
            'has_emoji': has_emoji,
            'positive_suggestion': positive_suggestion,
            'direct_positive_alternative': direct_positive_alternative
        }
        # Store in history
        history_entry = {
            **response,
            'timestamp': datetime.utcnow()
        }
        try:
            if use_local_storage:
                save_to_local_storage(history_entry, "history")
            else:
                history_collection.insert_one(history_entry)
        except Exception as storage_error:
            print(f"Error storing classification history entry: {storage_error}")
            # If MongoDB failed, switch to local storage
            if not use_local_storage:
                use_local_storage = True
                print("Switching to local storage due to MongoDB error in classify endpoint")
                # Try to save using local storage
                try:
                    save_to_local_storage(history_entry, "history")
                except Exception as local_error:
                    print(f"Error saving to local storage: {local_error}")
        return jsonify(response)
    except Exception as e:
        print(f"Error in classification: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/classify-file', methods=['POST'])
def classify_file():
    global use_local_storage
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
            total_lines = len(lines)
            # Create a progress endpoint to be polled by the frontend
            global file_processing_progress
            file_processing_progress = {
                'total': total_lines,
                'processed': 0,
                'in_progress': True
            }
            results = []
            for i, line in enumerate(lines):
                # Update progress
                file_processing_progress['processed'] = i + 1
                # Classify each line
                result = classifier(line)[0]
                confidence = result['score']
                # Find toxic words in the text (including emojis)
                toxic_words = []
                for word in TOXIC_WORDS:
                    if word in emoji.EMOJI_DATA:  # If it's an emoji
                        if word in line:
                            toxic_words.append(word)
                    else:  # If it's a regular word
                        if re.search(r'\b' + re.escape(word) + r'\b', line.lower()):
                            toxic_words.append(word)
                # Check for emojis
                has_emoji = contains_emoji(line)
                toxic_emojis = detect_toxic_emoji(line)
                # Add detected toxic emojis to toxic words list
                for emoji_char in toxic_emojis:
                    if emoji_char not in toxic_words:
                        toxic_words.append(emoji_char)
                # Determine classification
                classification = 'neutral'
                if confidence > 0.7 or toxic_words:
                    classification = 'toxic'
                elif confidence > 0.4:
                    classification = 'offensive'
                # Get positive suggestion
                positive_suggestion = get_positive_suggestion(classification)
                # Generate direct positive alternative for toxic messages
                # For file upload, remove emojis from the suggestions as requested
                direct_positive_alternative = None
                if classification in ['toxic', 'offensive']:
                    direct_positive_alternative = generate_direct_positive_alternative(line, toxic_words, remove_emoji=True)
                # Add to results
                results.append({
                    'text': line,
                    'classification': classification,
                    'confidence': confidence,
                    'toxic_words': toxic_words,
                    'has_emoji': has_emoji,
                    'positive_suggestion': positive_suggestion,
                    'direct_positive_alternative': direct_positive_alternative
                })
                # Store in history
                history_entry = {
                    'text': line,
                    'classification': classification,
                    'confidence': confidence,
                    'toxic_words': toxic_words,
                    'has_emoji': has_emoji,
                    'positive_suggestion': positive_suggestion,
                    'direct_positive_alternative': direct_positive_alternative,
                    'timestamp': datetime.utcnow(),
                    'source': 'file'
                }
                try:
                    if use_local_storage:
                        save_to_local_storage(history_entry, "history")
                    else:
                        history_collection.insert_one(history_entry)
                except Exception as storage_error:
                    print(f"Error storing history entry: {storage_error}")
                    # If MongoDB failed, switch to local storage
                    if not use_local_storage:
                        use_local_storage = True
                        print("Switching to local storage due to MongoDB error")
                        # Try to save using local storage
                        try:
                            save_to_local_storage(history_entry, "history")
                        except Exception as local_error:
                            print(f"Error saving to local storage: {local_error}")
                # Simulate some processing time so frontend can show progress
                # For production, remove this artificial delay
                time.sleep(0.05)
            # Mark processing as complete
            file_processing_progress['in_progress'] = False
            return jsonify({
                'results': results,
                'total': len(results)
            })
        return jsonify({"error": "Invalid file type. Only .txt and .csv files are allowed"}), 400
    except Exception as e:
        print(f"Error in file classification: {e}")
        # Mark processing as failed
        if 'file_processing_progress' in globals():
            file_processing_progress['in_progress'] = False
            file_processing_progress['error'] = str(e)
        return jsonify({"error": str(e)}), 500

# Initialize global progress tracking
file_processing_progress = {
    'total': 0,
    'processed': 0,
    'in_progress': False,
    'error': None
}

# Endpoint to check file processing progress
@app.route('/api/content/progress', methods=['GET'])
def get_processing_progress():
    return jsonify(file_processing_progress)

@app.route('/api/content/feedback', methods=['POST'])
def submit_feedback():
    global use_local_storage
    try:
        data = request.json
        if not data or not data.get('originalText') or not data.get('correctClassification'):
            return jsonify({"error": "Invalid feedback data"}), 400
        # Create feedback entry
        feedback_entry = {
            'original_text': data.get('originalText'),
            'original_classification': data.get('originalClassification'),
            'correct_classification': data.get('correctClassification'),
            'comment': data.get('comment', ''),
            'timestamp': datetime.utcnow()
        }
        # Store feedback
        try:
            if use_local_storage:
                save_to_local_storage(feedback_entry, "feedback")
                print("Feedback saved to local storage")
            else:
                feedback_collection.insert_one(feedback_entry)
                print("Feedback saved to MongoDB")
        except Exception as storage_error:
            print(f"Error storing feedback: {storage_error}")
            # If MongoDB failed, switch to local storage
            if not use_local_storage:
                use_local_storage = True
                print("Switching to local storage due to MongoDB error in feedback endpoint")
                # Try to save using local storage
                try:
                    save_to_local_storage(feedback_entry, "feedback")
                    print("Feedback saved to local storage after MongoDB failure")
                except Exception as local_error:
                    print(f"Error saving feedback to local storage: {local_error}")
                    return jsonify({"error": "Could not save feedback"}), 500
        return jsonify({"message": "Feedback submitted successfully"})
    except Exception as e:
        print(f"Error submitting feedback: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/history', methods=['GET'])
def get_history():
    global use_local_storage
    try:
        if use_local_storage:
            entries = get_from_local_storage("history")
            # Sort by timestamp (newest first)
            entries.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        else:
            try:
                # Try to get history entries from MongoDB
                entries = list(history_collection.find({}, {'_id': 0}).sort('timestamp', -1))
            except Exception as mongo_error:
                # If MongoDB fails, log error and fall back to local storage
                print(f"MongoDB error when getting history, falling back to local storage: {mongo_error}")
                # Set use_local_storage to True for future requests in this session
                use_local_storage = True
                # Get data from local storage instead
                entries = get_from_local_storage("history")
                # Sort by timestamp (newest first)
                entries.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return jsonify(entries)
    except Exception as e:
        print(f"Error getting history: {e}")
        # Return empty array instead of error to prevent UI issues
        return jsonify([])

@app.route('/api/content/clear-history', methods=['DELETE'])
def clear_history():
    global use_local_storage
    try:
        if use_local_storage:
            success = clear_local_storage("history")
            deleted_count = 0 if success else "unknown"
        else:
            try:
                result = history_collection.delete_many({})
                deleted_count = result.deleted_count
            except Exception as mongo_error:
                print(f"MongoDB error when clearing history, falling back to local storage: {mongo_error}")
                use_local_storage = True
                success = clear_local_storage("history")
                deleted_count = 0 if success else "unknown"
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