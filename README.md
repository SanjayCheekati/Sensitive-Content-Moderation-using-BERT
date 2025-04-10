# Sensitive Content Moderation System using BERT Algorithm 🔍

A modern web application that performs intelligent text analysis using BERT models, providing toxicity detection and sentiment analysis with an intuitive user interface.

## ✨ Features

- 📊 Real-time text analysis using BERT models
- 🎨 Modern, responsive UI with dark mode support
- 📁 File upload support for batch analysis
- 📈 Interactive visualization of analysis results
- 💾 History tracking with MongoDB integration
- 🔄 API endpoint for text classification
- 💬 Positive alternative suggestions for toxic content
- 🔍 Advanced emoji detection and analysis
- 📊 Real-time progress tracking for batch processing
- 🌓 Customizable dark/light theme toggle

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- React Icons
- Chart.js

### Backend
- Flask
- Transformers (Hugging Face)
- MongoDB with local storage fallback
- Python 3.8+
- Emoji detection

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB (optional - the system can work with local storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YourUsername/Sensitive-Content-Moderation-System
```

2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Setup Frontend
```bash
cd frontend
npm install
```

4. Environment Variables
Create `.env` files in both frontend and backend directories (see `.env.example` for reference)

### Running the Application

1. Start Backend
```bash
cd backend
python app.py
```

2. Start Frontend
```bash
cd frontend
npm start
```

Visit `http://localhost:3000` to access the application.

## 📝 API Documentation

### Text Classification Endpoint
- **URL**: `/api/content/classify`
- **Method**: `POST`
- **Body**: `{ "text": "string" }`
- **Response**: 
```json
{
  "text": "string",
  "classification": "string", 
  "confidence": number,
  "toxic_words": ["string"],
  "has_emoji": boolean,
  "positive_suggestion": "string",
  "direct_positive_alternative": "string",
  "timestamp": "string"
}
```

### File Classification Endpoint
- **URL**: `/api/content/classify-file`
- **Method**: `POST`
- **Body**: Form data with file
- **Response**: 
```json
{
  "results": [
    {
      "text": "string",
      "classification": "string",
      "confidence": number,
      "toxic_words": ["string"],
      "has_emoji": boolean,
      "positive_suggestion": "string",
      "direct_positive_alternative": "string"
    }
  ],
  "total": number
}
```

### Progress Tracking Endpoint
- **URL**: `/api/content/progress`
- **Method**: `GET`
- **Response**: 
```json
{
  "total": number,
  "processed": number,
  "in_progress": boolean,
  "error": "string" (optional)
}
```

## 🌟 Key Features Explained

### Toxicity Detection
The system uses a BERT-based model to analyze and classify text as toxic, offensive, or neutral. It can detect toxic words, phrases, and even emojis in the input text.

### Positive Alternative Suggestions
For toxic or offensive content, the system provides two types of suggestions:
1. **Direct Positive Alternatives**: Transforms the original message into a positive version by replacing toxic words with positive ones.
2. **Constructive Responses**: Suggests how to respond to toxic content in a more constructive way.

### Visualization
The BERT visualization feature shows the step-by-step process of how the BERT model analyzes text, from tokenization to final classification.

### Batch Processing
Upload text files or CSV files for batch analysis, with real-time progress tracking.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - [GitHub Profile](https://github.com/YourUsername)

## 🙏 Acknowledgments

- HuggingFace for BERT models
- MongoDB Atlas for database hosting