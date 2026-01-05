import os
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pypdf

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

def get_text_from_pdf():
    if not os.path.exists("./books"):
        os.makedirs("./books")
        return "Папка books была пуста, я её создал."

    pdf_files = [f for f in os.listdir("./books") if f.endswith(".pdf")]
    if not pdf_files:
        return "В папке books нет PDF файлов."

    try:
        reader = pypdf.PdfReader(os.path.join("./books", pdf_files[0]))
        text = ""
        for i in range(min(3, len(reader.pages))):
            text += reader.pages[i].extract_text()
        return text[:3000]
    except Exception as e:
        return f"Ошибка чтения PDF: {e}"

@app.post("/solve")
async def solve(request: Request):
    form_data = await request.form()
    task_text = form_data.get("task", "")
    print(f"--- Получено задание: {task_text} ---")

    context = get_text_from_pdf()
    print("--- Контекст из учебника извлечен ---")

    try:
        print("--- Запрос к Perplexity... ---")
        response = client.chat.completions.create(
                    model="sonar", # Обновленное название модели
                    messages=[
                        {
                            "role": "system",
                            "content": f"Ты — эксперт по школьной программе РБ. Используй текст учебника: {context}"
                        },
                        {
                            "role": "user",
                            "content": task_text
                        }
                    ]
                )
        ai_answer = response.choices[0].message.content
        print("--- Ответ от ИИ получен успешно! ---")
        return {"result": ai_answer}
    except Exception as e:
        print(f"!!! ОШИБКА API: {e}")
        return {"result": f"Ошибка нейросети: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)