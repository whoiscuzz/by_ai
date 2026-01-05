import { useState } from 'react'
import './App.css'

function App() {
    const [task, setTask] = useState('')
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSolve = async () => {
        if (!task) return alert('Сначала введи задание!')

        setLoading(true)
        // Это заглушка, пока мы не подключили Python-сервер
        setTimeout(() => {
            setResult('ИИ проанализировал учебники РБ и скоро здесь будет решение для задания: ' + task)
            setLoading(false)
        }, 1500)
    }

    return (
        <div className="container">
            <h1>BY AI: Помощник по учебе</h1>
            <p className="subtitle">Анализ заданий на основе учебников РБ</p>

            <div className="card">
                <h3>Задание или Бланк</h3>
                <textarea
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Вставь текст задания или опиши, что нужно заполнить в бланке..."
                />

                <div className="button-group">
                    <button onClick={handleSolve} disabled={loading}>
                        {loading ? 'Связываюсь с базой учебников...' : 'Решить по программе РБ'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="result-card">
                    <h3>Результат:</h3>
                    <p>{result}</p>
                </div>
            )}
        </div>
    )
}

export default App