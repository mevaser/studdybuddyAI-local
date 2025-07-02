from langchain.document_loaders import DirectoryLoader, PyPDFLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# השלב הכי חשוב – נתיב לתיקייה שלך
folder_path = r"C:\Users\User\Desktop\אגם\לימודים\שנה ג\פרוייקט\networks course"

# טוען PDF
pdf_loader = DirectoryLoader(
    folder_path, glob="**/*.pdf", loader_cls=PyPDFLoader
)

# טוען DOCX
docx_loader = DirectoryLoader(
    folder_path, glob="**/*.docx", loader_cls=Docx2txtLoader
)

# איחוד כל המסמכים
documents = []
for loader in [pdf_loader, docx_loader]:
    documents.extend(loader.load())

print(f"Total loaded documents: {len(documents)}")

# פיצול המסמכים לקטעים בגודל של עד 500 תווים (עם חפיפה קלה)
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
split_docs = splitter.split_documents(documents)

print(f"Total text chunks: {len(split_docs)}")
print("\n--- Example chunk ---\n")
print(split_docs[0].page_content)

# שלב 1 – טען את המפתח מתוך הקובץ .env
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# שלב 2 – צור Embedding Model של OpenAI
embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)

# שלב 3 – צור FAISS Vector Store מהקטעים שיצרנו קודם
vector_store = FAISS.from_documents(split_docs, embedding_model)

# שלב 4 – שמור אותו מקומית בשם faiss_index
vector_store.save_local("faiss_index")

print("✅ FAISS vector store created and saved!")