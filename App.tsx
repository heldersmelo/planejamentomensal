import { useState, useEffect } from 'react';
import { Calendar, Target, Dumbbell, BookOpen, Church, Briefcase, BarChart3, Plus, Minus } from 'lucide-react';

interface DailyTracking {
  [day: number]: {
    leitura: boolean;
    oracao: boolean;
  };
}

interface MonthlyPlan {
  month: string;
  year: number;
  monthIndex: number;
  pessoais: {
    academiaCount: number;
    academiaGoal: number;
    leituraNotas: string;
    oracaoNotas: string;
    dailyTracking: DailyTracking;
  };
  profissionais: {
    projetos: string;
    cursos: string;
    networking: string;
    melhorias: string;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'planejamento' | 'acompanhamento' | 'relatorios'>('planejamento');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [plan, setPlan] = useState<MonthlyPlan>({
    month: '',
    year: currentYear,
    monthIndex: currentMonth,
    pessoais: {
      academiaCount: 0,
      academiaGoal: 20,
      leituraNotas: '',
      oracaoNotas: '',
      dailyTracking: {},
    },
    profissionais: {
      projetos: '',
      cursos: '',
      networking: '',
      melhorias: '',
    },
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Load saved plan from localStorage
  useEffect(() => {
    const key = `plan-${currentYear}-${currentMonth}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setPlan(JSON.parse(saved));
    } else {
      setPlan({
        month: months[currentMonth],
        year: currentYear,
        monthIndex: currentMonth,
        pessoais: {
          academiaCount: 0,
          academiaGoal: 20,
          leituraNotas: '',
          oracaoNotas: '',
          dailyTracking: {},
        },
        profissionais: {
          projetos: '',
          cursos: '',
          networking: '',
          melhorias: '',
        },
      });
    }
  }, [currentMonth, currentYear]);

  // Save plan to localStorage
  const savePlan = (updatedPlan: MonthlyPlan) => {
    const key = `plan-${currentYear}-${currentMonth}`;
    localStorage.setItem(key, JSON.stringify(updatedPlan));
    setPlan(updatedPlan);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const updateAcademiaCount = (delta: number) => {
    const newCount = Math.max(0, plan.pessoais.academiaCount + delta);
    savePlan({
      ...plan,
      pessoais: { ...plan.pessoais, academiaCount: newCount },
    });
  };

  const updateAcademiaGoal = (value: number) => {
    savePlan({
      ...plan,
      pessoais: { ...plan.pessoais, academiaGoal: Math.max(1, value) },
    });
  };

  const toggleDailyTracking = (day: number, type: 'leitura' | 'oracao') => {
    const current = plan.pessoais.dailyTracking[day] || { leitura: false, oracao: false };
    savePlan({
      ...plan,
      pessoais: {
        ...plan.pessoais,
        dailyTracking: {
          ...plan.pessoais.dailyTracking,
          [day]: {
            ...current,
            [type]: !current[type],
          },
        },
      },
    });
  };

  const updateProfissional = (field: keyof MonthlyPlan['profissionais'], value: string) => {
    savePlan({
      ...plan,
      profissionais: { ...plan.profissionais, [field]: value },
    });
  };

  const updatePessoalNotas = (field: 'leituraNotas' | 'oracaoNotas', value: string) => {
    savePlan({
      ...plan,
      pessoais: { ...plan.pessoais, [field]: value },
    });
  };

  // Get all saved months for reports
  const getAllSavedMonths = (): MonthlyPlan[] => {
    const saved: MonthlyPlan[] = [];
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 0; month < 12; month++) {
        const key = `plan-${year}-${month}`;
        const data = localStorage.getItem(key);
        if (data) {
          saved.push(JSON.parse(data));
        }
      }
    }
    return saved.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthIndex - a.monthIndex;
    });
  };

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  };

  const getLeituraDays = () => {
    return Object.values(plan.pessoais.dailyTracking).filter(d => d.leitura).length;
  };

  const getOracaoDays = () => {
    return Object.values(plan.pessoais.dailyTracking).filter(d => d.oracao).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-gray-900">Planejamento Mensal</h1>
                <p className="text-gray-600">Organize e acompanhe suas metas</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('planejamento')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'planejamento'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Planejamento
            </button>
            <button
              onClick={() => setActiveTab('acompanhamento')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'acompanhamento'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Dumbbell className="w-4 h-4 inline mr-2" />
              Acompanhamento
            </button>
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'relatorios'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Relatórios
            </button>
          </div>

          {/* Month Selector */}
          {activeTab !== 'relatorios' && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleMonthChange('prev')}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                ← Anterior
              </button>
              <div className="text-center min-w-[200px]">
                <div className="text-gray-900">{months[currentMonth]} {currentYear}</div>
              </div>
              <button
                onClick={() => handleMonthChange('next')}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                Próximo →
              </button>
            </div>
          )}
        </div>

        {/* Planejamento Tab */}
        {activeTab === 'planejamento' && (
          <div className="space-y-4">
            {/* Metas Pessoais */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-gray-900 mb-4">📋 Metas Pessoais</h2>
              
              <div className="space-y-4">
                {/* Academia Goal */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <label className="text-gray-700 mb-2 block">🏋️ Meta de Academia</label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">Ir</span>
                    <input
                      type="number"
                      value={plan.pessoais.academiaGoal}
                      onChange={(e) => updateAcademiaGoal(parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    />
                    <span className="text-gray-600">vezes no mês</span>
                  </div>
                </div>

                {/* Leitura */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="text-gray-700 mb-2 block">📖 Leitura Diária</label>
                  <textarea
                    value={plan.pessoais.leituraNotas}
                    onChange={(e) => updatePessoalNotas('leituraNotas', e.target.value)}
                    placeholder="Ex: Ler 20 páginas por dia, terminar livro X..."
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>

                {/* Orações */}
                <div className="p-4 bg-pink-50 rounded-lg">
                  <label className="text-gray-700 mb-2 block">🙏 Orações Diárias</label>
                  <textarea
                    value={plan.pessoais.oracaoNotas}
                    onChange={(e) => updatePessoalNotas('oracaoNotas', e.target.value)}
                    placeholder="Ex: Orar pela manhã e à noite, ler salmo do dia..."
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Metas Profissionais */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-gray-900 mb-4">💼 Metas Profissionais</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Projetos</label>
                  <textarea
                    value={plan.profissionais.projetos}
                    onChange={(e) => updateProfissional('projetos', e.target.value)}
                    placeholder="Ex: Concluir projeto X, iniciar projeto Y..."
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                </div>

                <div>
                  <label className="text-gray-700 mb-2 block">Cursos & Aprendizado</label>
                  <textarea
                    value={plan.profissionais.cursos}
                    onChange={(e) => updateProfissional('cursos', e.target.value)}
                    placeholder="Ex: Fazer curso de React, estudar design patterns..."
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                </div>

                <div>
                  <label className="text-gray-700 mb-2 block">Networking</label>
                  <textarea
                    value={plan.profissionais.networking}
                    onChange={(e) => updateProfissional('networking', e.target.value)}
                    placeholder="Ex: Participar de 2 eventos, conectar com profissionais da área..."
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                </div>

                <div>
                  <label className="text-gray-700 mb-2 block">Melhorias & Habilidades</label>
                  <textarea
                    value={plan.profissionais.melhorias}
                    onChange={(e) => updateProfissional('melhorias', e.target.value)}
                    placeholder="Ex: Melhorar comunicação, aprender nova ferramenta..."
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acompanhamento Tab */}
        {activeTab === 'acompanhamento' && (
          <div className="space-y-4">
            {/* Academia Counter */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900">🏋️ Academia</h2>
                <div className="text-gray-600">
                  Meta: {plan.pessoais.academiaGoal}x
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  onClick={() => updateAcademiaCount(-1)}
                  className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <div className="text-center">
                  <div className="text-gray-900 mb-1">{plan.pessoais.academiaCount}</div>
                  <div className="text-gray-500">vezes</div>
                </div>
                
                <button
                  onClick={() => updateAcademiaCount(1)}
                  className="p-3 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min((plan.pessoais.academiaCount / plan.pessoais.academiaGoal) * 100, 100)}%` }}
                />
              </div>
              <div className="text-center mt-2 text-gray-600">
                {Math.round((plan.pessoais.academiaCount / plan.pessoais.academiaGoal) * 100)}% concluído
              </div>
            </div>

            {/* Daily Tracking */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-gray-900 mb-4">📅 Acompanhamento Diário</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-gray-700">Leitura</div>
                  <div className="text-gray-900">{getLeituraDays()} / {getDaysInMonth()} dias</div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <Church className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-gray-700">Oração</div>
                  <div className="text-gray-900">{getOracaoDays()} / {getDaysInMonth()} dias</div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((day) => {
                  const tracking = plan.pessoais.dailyTracking[day] || { leitura: false, oracao: false };
                  return (
                    <div key={day} className="border border-gray-200 rounded-lg p-2">
                      <div className="text-center text-gray-600 mb-2">{day}</div>
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleDailyTracking(day, 'leitura')}
                          className={`w-full p-1 rounded text-xs transition-colors ${
                            tracking.leitura
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          📖
                        </button>
                        <button
                          onClick={() => toggleDailyTracking(day, 'oracao')}
                          className={`w-full p-1 rounded text-xs transition-colors ${
                            tracking.oracao
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          🙏
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Relatórios Tab */}
        {activeTab === 'relatorios' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-gray-900 mb-6">📊 Histórico de Meses</h2>
              
              {getAllSavedMonths().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum mês registrado ainda. Comece a planejar!
                </div>
              ) : (
                <div className="space-y-6">
                  {getAllSavedMonths().map((monthData, index) => {
                    const leituraDays = Object.values(monthData.pessoais.dailyTracking).filter(d => d.leitura).length;
                    const oracaoDays = Object.values(monthData.pessoais.dailyTracking).filter(d => d.oracao).length;
                    const daysInMonth = new Date(monthData.year, monthData.monthIndex + 1, 0).getDate();
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-gray-900 mb-4">
                          {monthData.month} {monthData.year}
                        </h3>
                        
                        {/* Personal Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-gray-600 mb-1">🏋️ Academia</div>
                            <div className="text-gray-900">
                              {monthData.pessoais.academiaCount} / {monthData.pessoais.academiaGoal} vezes
                            </div>
                            <div className="text-gray-500">
                              {Math.round((monthData.pessoais.academiaCount / monthData.pessoais.academiaGoal) * 100)}%
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-gray-600 mb-1">📖 Leitura</div>
                            <div className="text-gray-900">{leituraDays} / {daysInMonth} dias</div>
                            <div className="text-gray-500">
                              {Math.round((leituraDays / daysInMonth) * 100)}%
                            </div>
                          </div>
                          
                          <div className="bg-pink-50 p-4 rounded-lg">
                            <div className="text-gray-600 mb-1">🙏 Oração</div>
                            <div className="text-gray-900">{oracaoDays} / {daysInMonth} dias</div>
                            <div className="text-gray-500">
                              {Math.round((oracaoDays / daysInMonth) * 100)}%
                            </div>
                          </div>
                        </div>

                        {/* Professional Goals */}
                        {(monthData.profissionais.projetos || 
                          monthData.profissionais.cursos || 
                          monthData.profissionais.networking || 
                          monthData.profissionais.melhorias) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-gray-700 mb-2">💼 Metas Profissionais:</div>
                            <div className="space-y-2 text-gray-600">
                              {monthData.profissionais.projetos && (
                                <div>• <span className="text-gray-500">Projetos:</span> {monthData.profissionais.projetos.substring(0, 100)}{monthData.profissionais.projetos.length > 100 ? '...' : ''}</div>
                              )}
                              {monthData.profissionais.cursos && (
                                <div>• <span className="text-gray-500">Cursos:</span> {monthData.profissionais.cursos.substring(0, 100)}{monthData.profissionais.cursos.length > 100 ? '...' : ''}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>Suas informações são salvas automaticamente 💜</p>
        </div>
      </div>
    </div>
  );
}
