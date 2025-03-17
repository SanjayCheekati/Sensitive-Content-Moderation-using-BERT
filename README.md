# Sensitive Content Moderation System using BERT Algorithm 🔍

A modern web application that performs intelligent text analysis using BERT models, providing toxicity detection and sentiment analysis with an intuitive user interface.

## ✨ Features

- 📊 Real-time text analysis using BERT models
- 🎨 Modern, responsive UI with dark mode support
- 📁 File upload support for batch analysis
- 📈 Interactive visualization of analysis results
- 💾 History tracking with MongoDB integration
- 🔄 API endpoint for text classification

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- React Icons

### Backend
- Flask
- Transformers (Hugging Face)
- MongoDB
- Python 3.8+

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/SanjayCheekati/Senstive-Content-Moderation-using-BERT
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
  "classification": "string",
  "confidence": number,
  "timestamp": "string"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Sanjay Cheekati - [GitHub Profile](https://github.com/SanjayCheekati)
- Harshitha Maryala - [GitHub Profile](https://github.com/Maryala-Harshitha58)

## 🙏 Acknowledgments

- HuggingFace for BERT models
- MongoDB Atlas for database hosting