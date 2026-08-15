import { useState } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Award, Brain, AlertTriangle, Sparkles, ArrowRight, CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge, KPICard, SectionHeader, Card, ProgressBar } from "../../../components/shared";
import { FONT_HEADING, FONT_MONO } from "../../../types";
import type { KnowledgeTestQuestion, TestResult } from "../../../types";

const H = FONT_HEADING;
const MONO = FONT_MONO;

export default function ClientConocimientoPage() {
  const [testMode, setTestMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [testDone, setTestDone] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const questions: KnowledgeTestQuestion[] = [
    {
      id: 1,
      category: "Macronutrientes",
      question: "¿Cuál de los siguientes es una fuente completa de proteínas?",
      options: ["Arroz blanco", "Huevo", "Pan integral", "Aceite de oliva"],
      correct: 1,
      explanation: "El huevo es una proteína completa porque contiene todos los aminoácidos esenciales en proporciones adecuadas."
    },
    {
      id: 2,
      category: "Suplementación",
      question: "¿Cuál es la dosis diaria recomendada de creatina para mantenimiento?",
      options: ["1-2g", "3-5g", "10-15g", "20-25g"],
      correct: 1,
      explanation: "La dosis de mantenimiento de creatina monohidratada es de 3-5g diarios después de la fase de carga."
    },
    {
      id: 3,
      category: "Hidratación",
      question: "¿Cuántos litros de agua se recomiendan al día para un adulto activo?",
      options: ["1 litro", "2-3 litros", "5-6 litros", "0.5 litros"],
      correct: 1,
      explanation: "Para adultos con actividad física moderada se recomiendan entre 2 y 3 litros de agua al día."
    },
    {
      id: 4,
      category: "Macronutrientes",
      question: "¿Qué tipo de carbohidrato es el más recomendado para consumo diario?",
      options: ["Azúcar refinada", "Carbohidratos simples", "Carbohidratos complejos", "Jarabe de maíz"],
      correct: 2,
      explanation: "Los carbohidratos complejos (granos enteros, legumbres) proporcionan energía sostenida y fibra."
    },
    {
      id: 5,
      category: "Suplementación",
      question: "¿Cuál de estos suplementos tiene mayor evidencia científica para rendimiento deportivo?",
      options: ["BCAAs", "Glutamina", "Creatina monohidratada", "Quemadores de grasa"],
      correct: 2,
      explanation: "La creatina monohidratada es uno de los suplementos más estudiados con sólida evidencia para fuerza y rendimiento."
    },
    {
      id: 6,
      category: "Nutrición general",
      question: "¿Cuál es el porcentaje calórico recomendado de grasas en una dieta balanceada?",
      options: ["5-10%", "20-35%", "50-60%", "70-80%"],
      correct: 1,
      explanation: "Las grasas deben representar entre el 20% y 35% del total calórico diario, priorizando grasas insaturadas."
    },
    {
      id: 7,
      category: "Suplementación",
      question: "¿Cuándo es más efectivo tomar proteína whey?",
      options: ["Solo en ayunas", "Post-entrenamiento (30 min)", "Antes de dormir únicamente", "No importa el momento"],
      correct: 1,
      explanation: "La ventana anabólica post-entrenamiento (hasta 30-60 min) maximiza la síntesis proteica muscular."
    },
    {
      id: 8,
      category: "Nutrición general",
      question: "¿Qué vitamina se obtiene principalmente de la exposición solar?",
      options: ["Vitamina C", "Vitamina B12", "Vitamina D", "Vitamina A"],
      correct: 2,
      explanation: "La vitamina D se sintetiza en la piel al exponerse a la radiación ultravioleta del sol."
    },
  ];

  const handleAnswer = (optIdx: number) => {
    setAnswers({ ...answers, [currentQ]: optIdx });
  };

  const finishTest = () => {
    setTestDone(true);
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    console.log("Test result:", { correct, total: questions.length, pct });
  };

  const resetTest = () => {
    setTestMode(false);
    setCurrentQ(0);
    setAnswers({});
    setTestDone(false);
    setShowResult(false);
  };

  const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
  const pctScore = Math.round((correctCount / questions.length) * 100);

  const categoryResults = [
    { cat: "Macronutrientes", score: 50, total: 2 },
    { cat: "Suplementación", score: 33, total: 3 },
    { cat: "Hidratación", score: 100, total: 1 },
    { cat: "Nutrición general", score: 50, total: 2 },
  ];

  const barData = categoryResults.map(c => ({
    category: c.cat.length > 14 ? c.cat.substring(0, 12) + "..." : c.cat,
    puntaje: c.score,
  }));

  const lastResult: TestResult = {
    fecha: "15 Jun 2026",
    puntaje: 72,
    nivel: "Medio",
    aciertos: 0,
    total: questions.length,
    categorias: categoryResults.map(c => ({
      nombre: c.cat,
      puntaje: c.score,
      total: c.total,
    })),
  };

  return (
    <div>
      <SectionHeader
        title="Conocimiento Nutricional"
        subtitle="Evalúa tu comprensión sobre alimentación, suplementos y nutrición"
        action={
          !testMode ? (
            <button
              onClick={() => setTestMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <BookOpen size={14} /> Iniciar evaluación
            </button>
          ) : (
            <button
              onClick={resetTest}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              <RotateCcw size={13} /> Reiniciar
            </button>
          )
        }
      />

      {!testMode && !showResult && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-5">
            <KPICard icon={Brain} title="Nivel actual" value="Medio" sub="Última evaluación" iconBg="bg-amber-500" />
            <KPICard icon={Award} title="Mejor puntaje" value="72%" sub="15 Jun 2026" iconBg="bg-indigo-500" />
            <KPICard icon={BookOpen} title="Evaluaciones" value="3" sub="Total realizadas" iconBg="bg-teal-500" />
            <KPICard icon={AlertTriangle} title="Área débil" value="Suplem." sub="33% en suplementación" iconBg="bg-rose-500" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <Card className="col-span-1 p-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Nivel de conocimiento</h4>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="72, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800" style={H}>72%</span>
                    <span className="text-[10px] text-slate-400">puntaje</span>
                  </div>
                </div>
                <Badge label="Nivel Medio" variant="warning" />
                <p className="text-xs text-slate-500 text-center mt-3">
                  Tienes una base sólida pero puedes mejorar en suplementación.
                </p>
              </div>
            </Card>

            <Card className="col-span-2 p-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Puntaje por categoría</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="puntaje" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800 text-sm" style={H}>Última evaluación</h4>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400" />
                <span className="text-xs text-slate-500">{lastResult.fecha}</span>
              </div>
            </div>
            <div className="space-y-3">
              {lastResult.categorias.map((cat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-slate-600 w-36 flex-shrink-0">{cat.nombre}</span>
                  <div className="flex-1">
                    <ProgressBar
                      value={cat.puntaje}
                      color={cat.puntaje >= 70 ? "bg-emerald-400" : cat.puntaje >= 40 ? "bg-amber-400" : "bg-rose-400"}
                    />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${
                    cat.puntaje >= 70 ? "text-emerald-600" : cat.puntaje >= 40 ? "text-amber-600" : "text-rose-600"
                  }`} style={MONO}>
                    {cat.puntaje}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge label={`Nivel: ${lastResult.nivel}`} variant="warning" />
                <span className="text-xs text-slate-500">{lastResult.puntaje}% global</span>
              </div>
              <button
                onClick={() => setShowResult(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                Ver resultado completo <ChevronRight size={11} />
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-dashed border-indigo-200 bg-indigo-50/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm" style={H}>Mejora tu conocimiento</h4>
                  <p className="text-[11px] text-slate-500">Realiza la evaluación para obtener recomendaciones personalizadas</p>
                </div>
              </div>
              <button
                onClick={() => setTestMode(true)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Comenzar evaluación <ArrowRight size={14} />
              </button>
            </Card>

            <Card className="p-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-3" style={H}>Temas recomendados</h4>
              <div className="space-y-2">
                {[
                  { topic: "Suplementación deportiva", level: "Básico", color: "rose" },
                  { topic: "Timing nutricional", level: "Intermedio", color: "amber" },
                  { topic: "Micronutrientes esenciales", level: "Básico", color: "amber" },
                ].map(t => (
                  <div key={t.topic} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <BookOpen size={13} className="text-indigo-500" />
                      <span className="text-xs text-slate-700 font-medium">{t.topic}</span>
                    </div>
                    <Badge label={t.level} variant={t.color === "rose" ? "danger" : "warning"} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {testMode && !testDone && (
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge label={questions[currentQ].category} variant="purple" />
              <span className="text-xs text-slate-400">Pregunta {currentQ + 1} de {questions.length}</span>
            </div>
            <span className="text-xs font-medium text-slate-500" style={MONO}>
              {Object.keys(answers).length}/{questions.length} respondidas
            </span>
          </div>

          <div className="mb-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          <h3 className="text-lg font-semibold text-slate-800 my-6" style={H}>
            {questions[currentQ].question}
          </h3>

          <div className="space-y-3 mb-8">
            {questions[currentQ].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm ${
                  answers[currentQ] === idx
                    ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                    : "border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    answers[currentQ] === idx
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Anterior
            </button>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(currentQ + 1)}
                disabled={answers[currentQ] === undefined}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 rounded-lg text-sm text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={finishTest}
                disabled={Object.keys(answers).length < questions.length}
                className="flex items-center gap-1 px-5 py-2 bg-emerald-600 rounded-lg text-sm text-white font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Finalizar evaluación <Award size={14} />
              </button>
            )}
          </div>
        </Card>
      )}

      {testMode && testDone && (
        <>
          <Card className={`p-6 mb-5 border-l-4 ${
            pctScore >= 70 ? "border-l-emerald-400" : pctScore >= 40 ? "border-l-amber-400" : "border-l-rose-400"
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado de la evaluación</div>
                <div className="text-2xl font-bold text-slate-800 mb-2" style={H}>
                  {pctScore >= 70 ? "Nivel Alto" : pctScore >= 40 ? "Nivel Medio" : "Nivel Bajo"}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    Respondiste correctamente <strong className="text-slate-800">{correctCount}</strong> de <strong className="text-slate-800">{questions.length}</strong> preguntas
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  pctScore >= 70 ? "text-emerald-600" : pctScore >= 40 ? "text-amber-600" : "text-rose-600"
                }`} style={H}>
                  {pctScore}%
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <Card className="p-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Puntaje por categoría</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="puntaje" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Detalle de respuestas</h4>
              <div className="space-y-2.5">
                {questions.map((q, i) => {
                  const isCorrect = answers[i] === q.correct;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg ${isCorrect ? "bg-emerald-50" : "bg-rose-50"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCorrect ? "bg-emerald-500" : "bg-rose-500"
                      }`}>
                        {isCorrect ? <CheckCircle size={11} className="text-white" /> : <XCircle size={11} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-700 font-medium truncate">{q.question}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {isCorrect ? "Correcto" : `Respuesta: ${q.options[q.correct]}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-5 mb-5">
            <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Explicaciones</h4>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.correct;
                return (
                  <div key={i} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      }`}>
                        {isCorrect ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge label={q.category} variant="purple" />
                          <span className="text-xs text-slate-500">Pregunta {i + 1}</span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium mb-2">{q.question}</p>
                        <p className="text-xs text-slate-500">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-center gap-3">
            <button
              onClick={resetTest}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 font-semibold hover:bg-slate-50"
            >
              <RotateCcw size={14} /> Volver al inicio
            </button>
            <button
              onClick={() => { setCurrentQ(0); setAnswers({}); setTestDone(false); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-lg text-sm text-white font-semibold hover:bg-indigo-700"
            >
              <BookOpen size={14} /> Repetir evaluación
            </button>
          </div>
        </>
      )}

      {showResult && !testMode && (
        <>
          <Card className={`p-6 mb-5 border-l-4 ${
            lastResult.puntaje >= 70 ? "border-l-emerald-400" : lastResult.puntaje >= 40 ? "border-l-amber-400" : "border-l-rose-400"
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Resultado · {lastResult.fecha}
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-2" style={H}>
                  Nivel {lastResult.nivel}
                </div>
                <span className="text-sm text-slate-600">
                  Puntaje global: <strong className="text-slate-800">{lastResult.puntaje}%</strong>
                </span>
              </div>
              <div className={`text-4xl font-bold ${
                lastResult.puntaje >= 70 ? "text-emerald-600" : lastResult.puntaje >= 40 ? "text-amber-600" : "text-rose-600"
              }`} style={H}>
                {lastResult.puntaje}%
              </div>
            </div>
          </Card>

          <Card className="p-5 mb-5">
            <h4 className="font-semibold text-slate-800 text-sm mb-4" style={H}>Desglose por categoría</h4>
            <div className="space-y-3">
              {lastResult.categorias.map((cat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-slate-600 w-36 flex-shrink-0">{cat.nombre}</span>
                  <div className="flex-1">
                    <ProgressBar
                      value={cat.puntaje}
                      color={cat.puntaje >= 70 ? "bg-emerald-400" : cat.puntaje >= 40 ? "bg-amber-400" : "bg-rose-400"}
                    />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${
                    cat.puntaje >= 70 ? "text-emerald-600" : cat.puntaje >= 40 ? "text-amber-600" : "text-rose-600"
                  }`} style={MONO}>
                    {cat.puntaje}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-center">
            <button
              onClick={() => setShowResult(false)}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 font-semibold hover:bg-slate-50"
            >
              <ChevronLeft size={14} /> Volver al resumen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
