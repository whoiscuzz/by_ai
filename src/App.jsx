import { useState } from 'react'
import './App.css'

function App() {
    const [task, setTask] = useState('')
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSolve = async () => {
        if (!task) return alert('Сначала введи задание!')

        setLoading(true)
        setResult('')

        try {
            const formData = new FormData()
            formData.append('task', task)

            const response = await fetch('http://127.0.0.1:8000/solve', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`)
            }

            const data = await response.json()
            setResult(data.result)
        } catch (error) {
            console.error(error)
            setResult('ОШИБКА СВЯЗИ: ' + error.message + '. Убедись, что Python-сервер запущен!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>BY AI: Помощник по учебе</h1>
            <div className="card">
        <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Введи задание..."
        />
                <button onClick={handleSolve} disabled={loading}>
                    {loading ? 'Загрузка...' : 'Проверить связь с сервером'}
                </button>
            </div>
            {result && (
                <div className="result-card">
                    <p>{result}</p>
                </div>
            )}
        </div>
    )
}

export default App