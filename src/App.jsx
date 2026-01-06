import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Send, Loader2, Sparkles } from 'lucide-react'
import './App.css'

function App() {
    const [task, setTask] = useState('')
    const [subject, setSubject] = useState('algebra')
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)

    const subjects = [
        { id: 'algebra', name: 'Алгебра' }, { id: 'english', name: 'Англ яз' },
        { id: 'bel_lit', name: 'Бел лит' }, { id: 'bel_mova', name: 'Бел мова' },
        { id: 'bio', name: 'Биология' }, { id: 'phys', name: 'Физика' },
        { id: 'geom', name: 'Геометрия' }, { id: 'geo', name: 'География' },
        { id: 'soc', name: 'Обществоведение' }, { id: 'rus_yaz', name: 'Русс яз' },
        { id: 'rus_lit', name: 'Русс лит' }, { id: 'hist', name: 'История' }
    ]

    const handleSolve = async () => {
        if (!task) return
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
            const data = await response.json()
            setResult(data.result)
        } catch (error) {
            setResult('ОШИБКА: Проверь, запущен ли бекенд!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen">
            {}
            <div className="glow-overlay"></div>

            <main className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="header"
                >
                    <div className="logo-badge">BY AI</div>
                    <h1>Скриптер <span className="text-gradient">РБ</span></h1>
                    <p className="subtitle">Твой персональный ИИ-репетитор по школьной программе</p>
                </motion.div>

                <div className="main-grid">
                    {/* Боковая панель выбора предметов */}
                    <div className="sidebar">
                        <h3>Предметы</h3>
                        <div className="subject-list">
                            {subjects.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubject(s.id)}
                                    className={`subject-item ${subject === s.id ? 'active' : ''}`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="input-area">
                        <div className="input-wrapper">
                            <textarea
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                placeholder="Вставь условие задачи или вопрос..."
                            />
                            <button
                                onClick={handleSolve}
                                disabled={loading || !task}
                                className="solve-btn"
                            >
                                {loading ? <Loader2 className="spinner" /> : <Send size={20} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="result-box"
                                >
                                    <div className="result-header">
                                        <Sparkles size={16} />
                                        <span>Решение от ИИ</span>
                                    </div>
                                    <div className="result-text">{result}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App