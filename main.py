from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pypdf
import os
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройка клиента Perplexity
client = OpenAI(
    api_key="YOUR_PERPLEXITY_KEY",
    base_url="https://api.perplexity.ai"
)

def get_text_from_pdf():
    if not os.path.exists("./books"):
        return "Папка books не найдена"

    pdf_files = [f for f in os.listdir("./books") if f.endswith(".pdf")]
    if not pdf_files:
        return "Учебники в формате PDF не найдены"

    try:
        reader = pypdf.PdfReader(os.path.join("./books", pdf_files[0]))
        # Извлекаем текст с первых 3 страниц, чтобы ИИ было на что опираться
        text = ""
        for i in range(min(3, len(reader.pages))):
            text += reader.pages[i].extract_text()
        return text[:3000]
    except:
        return "Не удалось прочитать PDF"

@app.post("/solve")
async def solve(request: Request):
    form_data = await request.form()
    task_text = form_data.get("task", "")

    book_context = get_text_from_pdf()

    # Формируем запрос к ИИ
    response = client.chat.completions.create(
        model="llama-3.1-sonar-small-128k-online",
        messages=[
            {
                "role": "system",
                "content": f"Ты — помощник по образованию РБ. Используй этот текст из учебника для решения: {book_context}"
            },
            {
                "role": "user",
                "content": f"Реши задачу, оформляя её строго по правилам из учебника: {task_text}"
            }
        ]
    )

    ai_answer = response.choices[0].message.content
    return {"result": ai_answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)