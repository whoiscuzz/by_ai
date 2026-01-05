import { useState } from 'react'
import './App.css'

function App() {
    const [task, setTask] = useState('')
    const [subject, setSubject] = useState('algebra')
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const subjects = [
        { id: 'algebra', name: 'Алгебра' },
        { id: 'english', name: 'Англ яз' },
        { id: 'bel_lit', name: 'Бел лит' },
        { id: 'bel_mova', name: 'Бел мова' },
        { id: 'bio', name: 'Биология' },
        { id: 'phys', name: 'Физика' },
        { id: 'geom', name: 'Геометрия' },
        { id: 'geo', name: 'География' },
        { id: 'soc', name: 'Обществоведение' },
        { id: 'rus_yaz', name: 'Русс яз' },
        { id: 'rus_lit', name: 'Русс лит' },
        { id: 'hist', name: 'История' }
    ]

    const handleSolve = async () => {
        if (!task) return alert('Сначала введи задание!')

        setLoading(true)
        setResult('')

        try {
            const formData = new FormData()
            formData.append('task', task)
            formData.append('subject', subject)

            const response = await fetch('http://127.0.0.1:8080/solve', {
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
            setResult('ОШИБКА СВЯЗИ: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>BY AI: Помощник по учебе</h1>
            <div className="card">
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="subject-select"
                >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <textarea
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Введи задание..."
                />

                <button onClick={handleSolve} disabled={loading}>
                    {loading ? 'Скриптер ищет в учебнике...' : 'Решить задачу'}
                </button>
            </div>

            {result && (
                <div className="result-card">
                    <div className="result-content">{result}</div>
                </div>
            )}
        </div>
    )
}

export default App