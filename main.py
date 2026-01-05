import os
import pypdf
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"),
    base_url="https://api.perplexity.ai"
)

library_chunks = []

def load_library():
    global library_chunks
    library_chunks = []
    books_dir = "./books"

    if not os.path.exists(books_dir):
        os.makedirs(books_dir)
        return

    print("--- Загрузка учебников по категориям... ---")
    for filename in os.listdir(books_dir):
        if filename.endswith(".pdf"):
            try:
                # Определяем предмет по началу имени файла (например, "algebra_8.pdf" -> "algebra")
                subject_tag = filename.split('_')[0].lower()
                reader = pypdf.PdfReader(os.path.join(books_dir, filename))

                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and len(text.strip()) > 100:
                        library_chunks.append({
                            "text": text,
                            "meta": f"{filename}, стр. {i+1}",
                            "subject": subject_tag
                        })
                print(f"Загружен: {filename} (Категория: {subject_tag})")
            except Exception as e:
                print(f"Ошибка в файле {filename}: {e}")
    print(f"--- Всего блоков в памяти: {len(library_chunks)} ---")

load_library()

def find_info_in_subject(query, subject):
    # Фильтруем данные: берем только те, что относятся к выбранному предмету
    target_data = [c for c in library_chunks if c['subject'] == subject]

    if not target_data:
        return f"Учебник по предмету '{subject}' не найден."

    texts = [item["text"] for item in target_data]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts + [query])
    cosine_sim = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])

    top_indices = cosine_sim[0].argsort()[-3:][::-1]
    context = ""
    for idx in top_indices:
        if cosine_sim[0][idx] > 0.05:
            context += f"\n[Источник: {target_data[idx]['meta']}]\n{target_data[idx]['text']}\n"

    return context if context else "Совпадений в учебнике не найдено."

@app.post("/solve")
async def solve(request: Request):
    form_data = await request.form()
    task_text = form_data.get("task", "")
    selected_subject = form_data.get("subject", "algebra")

    print(f"--- Работаем с предметом: {selected_subject} ---")
    context = find_info_in_subject(task_text, selected_subject)

    try:
        response = client.chat.completions.create(
            model="sonar",
            messages=[
                {
                    "role": "system",
                    "content": f"""Ты — ИИ-помощник по образованию в РБ.
                    Твоя цель: решить задачу по предмету {selected_subject}, используя предоставленный текст учебника.
                    КОНТЕКСТ: {context}

                    ОФОРМЛЕНИЕ: Если это задача, пиши 'Дано', 'Решение', 'Ответ'.
                    Если это вопрос, отвечай четко по учебнику.
                    Если в учебнике нет инфы, реши сам, но предупреди об этом."""
                },
                {"role": "user", "content": task_text}
            ]
        )
        return {"result": response.choices[0].message.content}
    except Exception as e:
        return {"result": f"Ошибка нейросети: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)