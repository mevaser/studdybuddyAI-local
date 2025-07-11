# 🎓 StudyBuddyAI – Final Project for Computer Science Degree

StudyBuddyAI is an intelligent, cloud-based learning assistant designed to help students master university-level courses through personalized Q\&A, AI-powered explanations, and real-time analytics for lecturers.

This project was developed as a final project by a student team at Ruppin Academic Center.

---

## 🚀 Live Demo

> 🔒 Internal use only – deployed privately on AWS
> (Screenshots and video demo available upon request)

---

## 📚 Core Features

- 🧠 **AI Chat for Students** – Ask questions and get course-specific answers using GPT + context retrieval.
- 📊 **Dashboard for Lecturers** – Analyze student activity, find struggling students, and detect learning gaps.
- 🔍 **RAG (Retrieval-Augmented Generation)** – Combine GPT-4 with course materials and chat history.
- 🗃️ **Serverless Architecture** – 100% AWS Lambda + DynamoDB + S3 + API Gateway.
- 🔐 **Authentication & Role Management** – User login via AWS Cognito with permission-based routing.

---

## 🧩 System Architecture

- **Frontend:** HTML + Bootstrap + JS (Vanilla)
- **Backend:** Python (Lambda Functions)
- **Database:** DynamoDB (Users & StudentSession)
- **Vector DB:** Pinecone (contextual search)
- **LLMs:** OpenAI (GPT-4) + Google Vertex AI (Gemini)
- **Orchestration:** API Gateway, Cognito Auth, SQS

---

## 🔧 Project Structure

```
├── frontend/
│   ├── index.html
│   ├── pages-chat.html
│   ├── users-profile.html
│   ├── pages-teacher.html
│   ├── assets/js/
│   └── style.css
├── lambda_functions/
│   ├── GPTlambda/
│   ├── save_chat_session/
│   ├── classify_topic/
│   └── ...
├── docs/
│   └── architecture.png (optional)
└── README.md
```

---

## ⚙️ Deployment Notes

The system is deployed on AWS using serverless architecture:

- **Frontend:** Hosted on S3 with CloudFront
- **Backend:** AWS Lambda functions (Python 3.11/3.13)
- **Authentication:** AWS Cognito
- **Vector Indexing:** Pinecone (per-course index)

To deploy a Lambda:

1. Zip the folder inside `lambda_functions/`
2. Upload via AWS Console or CLI
3. Set environment variables (e.g., `api_key`, `PINECONE_INDEX`, `TABLE_NAME`)

---

## 📈 Example Use Cases

- A student asks: _"What's the difference between TCP and UDP?"_
  → GPT returns an answer based on course materials.

- A lecturer views the dashboard and sees:

  - Most asked topic: "Application Layer"
  - Least active student: [user@example.com](mailto:user@example.com)
  - Recommendation: "Consider reviewing DNS protocols in class."

---

## 👨‍💻 Team

- **Mevaser Zehoray**
- **Almog Zinger**
- **Agam Levi**

Academic supervisors:
Dr. Rina Tzviel-Gershin, Dr. Avner Friel

---

## 🛡️ Security Highlights

- Cognito authentication with role-based access
- All API calls protected by JWT validation
- Private EC2 + VPC setup for vector server (FAISS or alternatives)
- Environment variables for key management
- CORS-restricted API Gateway access

---

## 📌 Future Improvements

- Add support for multiple courses dynamically
- Enhance context with student history & profiles
- Integrate voice input/output (speech-to-speech)
- Automatic weekly reports to lecturers
- Support for multi-language Q\&A

---

## 📜 License

This project was developed for academic purposes and is currently private.
For commercial use or collaborations, please [contact us](mailto:mevaser1995@gmail.com).

```

```
