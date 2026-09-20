import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Car,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Gift,
  Heart,
  House,
  Image as ImageIcon,
  Laptop,
  ListChecks,
  Home,
  Pencil,
  Plane,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Target,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import "./App.css";

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "withdrawal";
  date: string;
  icon?: CategoryIcon | string;
  createdAt?: number;
  image?: string;
};

type CategoryIcon = "tag" | "work" | "shopping" | "food" | "transport" | "home" | "leisure";
type GoalIcon = "target" | "plane" | "shield" | "laptop" | "heart";

const categoryIcons: { value: CategoryIcon; label: string }[] = [
  { value: "tag", label: "Geral" },
  { value: "work", label: "Trabalho" },
  { value: "shopping", label: "Compras" },
  { value: "food", label: "Alimentação" },
  { value: "transport", label: "Transporte" },
  { value: "home", label: "Casa" },
  { value: "leisure", label: "Lazer" },
];

const goalIcons: { value: GoalIcon; label: string }[] = [
  { value: "target", label: "Alvo" },
  { value: "plane", label: "Viagem" },
  { value: "shield", label: "Reserva" },
  { value: "laptop", label: "Tecnologia" },
  { value: "heart", label: "Sonho" },
];

const CategoryIconView = ({
  icon,
  size = 17,
}: {
  icon?: CategoryIcon | string;
  size?: number;
}) => {
  if (typeof icon === "string" && icon.startsWith("data:"))
    return <img className="category-image" src={icon} alt="" />;
  if (icon === "work") return <BriefcaseBusiness size={size} />;
  if (icon === "shopping") return <ShoppingBag size={size} />;
  if (icon === "food") return <Utensils size={size} />;
  if (icon === "transport") return <Car size={size} />;
  if (icon === "home") return <Home size={size} />;
  if (icon === "leisure") return <Gift size={size} />;
  return <Tag size={size} />;
};

const GoalIconView = ({ icon, size = 17 }: { icon?: GoalIcon; size?: number }) => {
  if (icon === "plane") return <Plane size={size} />;
  if (icon === "shield") return <ShieldCheck size={size} />;
  if (icon === "laptop") return <Laptop size={size} />;
  if (icon === "heart") return <Heart size={size} />;
  return <Target size={size} />;
};

const readImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });

type Goal = {
  id: number;
  name: string;
  target: number;
  color: string;
  icon?: GoalIcon;
  image?: string;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    () =>
      JSON.parse(localStorage.getItem("cofre-transactions-v2") || "null") || [],
  );
  const [goals, setGoals] = useState<Goal[]>(
    () => JSON.parse(localStorage.getItem("cofre-goals-v2") || "null") || [],
  );
  const [profile, setProfile] = useState(
    () =>
      JSON.parse(localStorage.getItem("cofre-profile-v2") || "null") || {
        name: "Usuário",
        photo: "",
      },
  );
  const [modal, setModal] = useState<
    "income" | "withdrawal" | "goal" | "edit" | "goal-edit" | null
  >(null);
  const [activeTab, setActiveTab] = useState<"home" | "goals" | "profile">(
    "home",
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [lastUpdated, setLastUpdated] = useState(
    () => Number(localStorage.getItem("focus-last-updated")) || Date.now(),
  );
  const [clock, setClock] = useState(Date.now());

  useEffect(
    () =>
      localStorage.setItem(
        "cofre-transactions-v2",
        JSON.stringify(transactions),
      ),
    [transactions],
  );
  useEffect(
    () => localStorage.setItem("cofre-goals-v2", JSON.stringify(goals)),
    [goals],
  );
  useEffect(
    () => localStorage.setItem("cofre-profile-v2", JSON.stringify(profile)),
    [profile],
  );
  useEffect(() => {
    localStorage.setItem("focus-last-updated", String(lastUpdated));
  }, [lastUpdated]);
  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const updatedLabel = useMemo(() => {
    const elapsedMinutes = Math.max(
      0,
      Math.floor((clock - lastUpdated) / 60000),
    );
    if (elapsedMinutes < 1) return "Atualizado agora";
    if (elapsedMinutes < 60) return `Atualizado há ${elapsedMinutes} min`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    return `Atualizado há ${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`;
  }, [clock, lastUpdated]);

  const currentTime = () =>
    new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const withdrawals = transactions
    .filter((item) => item.type === "withdrawal")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = income - withdrawals;
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );
  const greeting = useMemo(() => {
    const hour = Number(
      new Intl.DateTimeFormat("pt-BR", {
        hour: "numeric",
        hour12: false,
        timeZone: "America/Sao_Paulo",
      }).format(new Date()),
    );
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);
  const categories = [
    ...new Set(
      transactions.map((transaction) => transaction.category).filter(Boolean),
    ),
  ];
  const sortedTransactions = [...transactions].sort(
    (first, second) =>
      (second.createdAt || second.id) - (first.createdAt || first.id),
  );
  const filteredTransactions =
    categoryFilter === "Todas"
      ? sortedTransactions
      : sortedTransactions.filter(
          (transaction) => transaction.category === categoryFilter,
        );
  const monthlyIncomeBars = Array.from({ length: 7 }, (_, index) =>
    transactions
      .filter((transaction) => {
        if (transaction.type !== "income" || !transaction.createdAt)
          return false;
        const date = new Date(transaction.createdAt);
        const now = new Date();
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          Math.min(6, Math.floor((date.getDate() - 1) / 5)) === index
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  const monthlyIncomeMax = Math.max(...monthlyIncomeBars, 0);
  const now = new Date();
  const currentMonthNet = transactions
    .filter(
      (transaction) =>
        transaction.createdAt &&
        new Date(transaction.createdAt).getMonth() === now.getMonth() &&
        new Date(transaction.createdAt).getFullYear() === now.getFullYear(),
    )
    .reduce(
      (sum, transaction) =>
        sum +
        (transaction.type === "income"
          ? transaction.amount
          : -transaction.amount),
      0,
    );
  const previousMonthNet = transactions
    .filter(
      (transaction) =>
        transaction.createdAt &&
        new Date(transaction.createdAt).getMonth() ===
          (now.getMonth() + 11) % 12 &&
        new Date(transaction.createdAt).getFullYear() ===
          (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()),
    )
    .reduce(
      (sum, transaction) =>
        sum +
        (transaction.type === "income"
          ? transaction.amount
          : -transaction.amount),
      0,
    );
  const monthlyChange = previousMonthNet
    ? ((currentMonthNet - previousMonthNet) / Math.abs(previousMonthNet)) * 100
    : null;
  const shouldRenderLegacySummary = () => false;

  const navigateTo = (tab: "home" | "goals" | "profile") => {
    setActiveTab(tab);
    setShowTransactions(false);
    if (tab === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    if (tab === "goals")
      document
        .getElementById("goals-section")
        ?.scrollIntoView({ behavior: "smooth" });
  };

  const addTransaction = async (
    event: FormEvent<HTMLFormElement>,
    type: Transaction["type"],
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!amount || amount <= 0) return;
    const imageFile = form.get("categoryImage");
    const image =
      imageFile instanceof File && imageFile.size
        ? await readImage(imageFile)
        : undefined;
    setTransactions((current) => [
      {
        id: Date.now(),
        title: String(form.get("title")),
        category: String(form.get("category")),
        amount,
        type,
        icon: image || (String(form.get("categoryIcon")) as CategoryIcon),
        image,
        date: `Hoje, ${currentTime()}`,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    setLastUpdated(Date.now());
    setModal(null);
  };

  const editTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTransaction) return;
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!amount || amount <= 0) return;
    const imageFile = form.get("categoryImage");
    const image =
      imageFile instanceof File && imageFile.size
        ? await readImage(imageFile)
        : editingTransaction.image;
    setTransactions((current) =>
      current.map((item) =>
        item.id === editingTransaction.id
          ? {
              ...item,
              title: String(form.get("title")),
              category: String(form.get("category")),
              amount,
              icon: image || (String(form.get("categoryIcon")) as CategoryIcon),
              image,
            }
          : item,
      ),
    );
    setLastUpdated(Date.now());
    setEditingTransaction(null);
    setModal(null);
  };

  const deleteTransaction = (transaction: Transaction) => {
    setTransactions((current) =>
      current.filter((item) => item.id !== transaction.id),
    );
    setLastUpdated(Date.now());
  };

  const deleteGoal = (goal: Goal) => {
    setGoals((current) => current.filter((item) => item.id !== goal.id));
    setLastUpdated(Date.now());
    setEditingGoal(null);
    setModal(null);
  };

  const saveGoal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = Number(form.get("target"));
    if (!String(form.get("name")).trim() || !target) return;
    const imageFile = form.get("goalImage");
    const image =
      imageFile instanceof File && imageFile.size
        ? await readImage(imageFile)
        : undefined;
    const icon = String(form.get("goalIcon")) as GoalIcon;
    if (modal === "goal-edit" && editingGoal) {
      setGoals((current) =>
        current.map((goal) =>
          goal.id === editingGoal.id
            ? {
                ...goal,
                name: String(form.get("name")),
                target,
                icon: image ? undefined : icon,
                image: image || undefined,
              }
            : goal,
        ),
      );
    } else {
      setGoals((current) => [
        ...current,
        {
          id: Date.now(),
          name: String(form.get("name")),
          target,
          color: "teal",
          icon: image ? undefined : icon,
          image,
        },
      ]);
    }
    setLastUpdated(Date.now());
    setEditingGoal(null);
    setModal(null);
  };

  const submitMovement = (event: FormEvent<HTMLFormElement>) => {
    if (modal === "edit") editTransaction(event);
    if (modal === "income" || modal === "withdrawal")
      addTransaction(event, modal);
  };

  const updateProfilePhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setProfile((current: typeof profile) => ({
        ...current,
        photo: String(reader.result),
      })),
    );
    reader.readAsDataURL(file);
  };

  return (
    <div className="app-shell">
      <main className="main-content">
        {activeTab === "home" && !showTransactions && (
          <header className="topbar">
            <div>
              <span className="eyebrow">{monthLabel}</span>
              <h1>
                {greeting}, {profile.name.split(" ")[0]}{" "}
                <span className="wave">✦</span>
              </h1>
            </div>
          </header>
        )}

        {activeTab === "home" && !showTransactions && (
          <>
            <section className="hero-grid">
              <div className="balance-card">
                <div className="balance-heading">
                  <span>Saldo disponível</span>
                  <span className="balance-status">
                    <i /> {updatedLabel}
                  </span>
                </div>
                <div className="balance-value">{formatCurrency(balance)}</div>
                <div className="balance-footer">
                  <span>
                    {monthlyChange === null ? (
                      <>
                        <ArrowUpRight size={15} /> Sem comparação{" "}
                        <small>vs. mês anterior</small>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight size={15} />{" "}
                        {monthlyChange >= 0 ? "+" : ""}
                        {monthlyChange.toFixed(1).replace(".", ",")}%{" "}
                        <small>vs. mês anterior</small>
                      </>
                    )}
                  </span>
                  <div className="sparkline">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
              <div className="action-card">
                <span className="eyebrow">Ações rápidas</span>
                <div className="actions">
                  <button onClick={() => setModal("income")}>
                    <span className="action-icon income">
                      <ArrowDownLeft size={19} />
                    </span>
                    <b>Adicionar ganho</b>
                    <small>Registre uma entrada</small>
                  </button>
                  <button onClick={() => setModal("withdrawal")}>
                    <span className="action-icon withdrawal">
                      <ArrowUpRight size={19} />
                    </span>
                    <b>Retirar dinheiro</b>
                    <small>Registre uma saída</small>
                  </button>
                </div>
              </div>
            </section>

            {shouldRenderLegacySummary() && (
              <section className="lower-grid">
                <div className="panel transactions-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">Acompanhe de perto</span>
                      <h2>Movimentações recentes</h2>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setShowTransactions(true)}
                    >
                      Ver tudo <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="transaction-list">
                    {transactions.length ? (
                      transactions.slice(0, 4).map((transaction) => (
                        <div className="transaction" key={transaction.id}>
                          <span
                            className={`transaction-icon ${transaction.type}`}
                          >
                            <CategoryIconView icon={transaction.icon} />
                          </span>
                          <div className="transaction-info">
                            <strong>{transaction.title}</strong>
                            <span>
                              {transaction.category} · {transaction.date}
                            </span>
                          </div>
                          <strong
                            className={`transaction-amount ${transaction.type}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </strong>
                          <div className="transaction-actions">
                            <button
                              onClick={() => {
                                setEditingTransaction(transaction);
                                setModal("edit");
                              }}
                              aria-label={`Editar ${transaction.title}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteTransaction(transaction)}
                              aria-label={`Apagar ${transaction.title}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-state">
                        Nenhuma movimentação registrada ainda.
                      </p>
                    )}
                  </div>
                </div>
                <div className="panel month-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">Resumo do mês</span>
                      <h2>Junho</h2>
                    </div>
                    <BarChart3 size={22} className="chart-icon" />
                  </div>
                  <div className="summary-row">
                    <div>
                      <span className="summary-label">
                        <i className="income-dot" /> Ganhos
                      </span>
                      <strong>{formatCurrency(income)}</strong>
                    </div>
                    <div>
                      <span className="summary-label">
                        <i className="withdrawal-dot" /> Retiradas
                      </span>
                      <strong>{formatCurrency(withdrawals)}</strong>
                    </div>
                  </div>
                  <div className="month-chart">
                    <span style={{ height: "4%" }} />
                    <span style={{ height: "4%" }} />
                    <span style={{ height: "4%" }} />
                    <span style={{ height: "4%" }} />
                    <span style={{ height: "4%" }} />
                    <span style={{ height: "4%" }} />
                    <span style={{ height: "4%" }} />
                  </div>
                  <div className="chart-labels">
                    <span>01 jun</span>
                    <span>30 jun</span>
                  </div>
                </div>
              </section>
            )}
            <section className="lower-grid">
              <div className="panel transactions-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Acompanhe de perto</span>
                    <h2>Movimentações recentes</h2>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setShowTransactions(true)}
                  >
                    Ver tudo <ChevronRight size={16} />
                  </button>
                </div>
                <div className="transaction-list">
                  {transactions.length ? (
                    transactions.slice(0, 4).map((transaction) => (
                      <div className="transaction" key={transaction.id}>
                        <span
                          className={`transaction-icon ${transaction.type}`}
                        >
                          <CategoryIconView icon={transaction.icon} />
                        </span>
                        <div className="transaction-info">
                          <strong>{transaction.title}</strong>
                          <span>
                            {transaction.category} · {transaction.date}
                          </span>
                        </div>
                        <strong
                          className={`transaction-amount ${transaction.type}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(transaction.amount)}
                        </strong>
                        <div className="transaction-actions">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setModal("edit");
                            }}
                            aria-label={`Editar ${transaction.title}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction)}
                            aria-label={`Apagar ${transaction.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">
                      Nenhuma movimentação registrada ainda.
                    </p>
                  )}
                </div>
              </div>
              <div className="panel month-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Resumo do mês</span>
                    <h2>Junho</h2>
                  </div>
                  <BarChart3 size={22} className="chart-icon" />
                </div>
                <div className="summary-row">
                  <div>
                    <span className="summary-label">
                      <i className="income-dot" /> Ganhos
                    </span>
                    <strong>{formatCurrency(income)}</strong>
                  </div>
                  <div>
                    <span className="summary-label">
                      <i className="withdrawal-dot" /> Retiradas
                    </span>
                    <strong>{formatCurrency(withdrawals)}</strong>
                  </div>
                </div>
                <div className="month-chart">
                  {monthlyIncomeBars.map((amount, index) => (
                    <span
                      key={index}
                      title={formatCurrency(amount)}
                      style={{
                        height: `${monthlyIncomeMax ? Math.max(8, Math.round((amount / monthlyIncomeMax) * 100)) : 4}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="chart-labels">
                  <span>01 jun</span>
                  <span>30 jun</span>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "goals" && (
          <section className="screen-section">
            <div className="screen-heading">
              <div>
                <span className="eyebrow">Seu dinheiro, com intenção</span>
                <h2>
                  Meus objetivos{" "}
                  <span className="count-badge">{goals.length}</span>
                </h2>
                <p>Acompanhe o progresso do que importa para você.</p>
              </div>
            </div>
            <section className="goals-grid">
              {goals.map((goal) => {
                const goalBalance = Math.max(0, balance);
                const percent = Math.min(
                  100,
                  Math.round((goalBalance / goal.target) * 100),
                );
                return (
                  <article className="goal-card" key={goal.id}>
                    <div className="goal-top">
                      <span className={`goal-symbol ${goal.color}`}>
                        {goal.image ? (
                          <img className="goal-image" src={goal.image} alt="" />
                        ) : (
                          <GoalIconView icon={goal.icon} />
                        )}
                      </span>
                      <button
                        className="more-button"
                        onClick={() => {
                          setEditingGoal(goal);
                          setModal("goal-edit");
                        }}
                        aria-label={`Editar ${goal.name}`}
                      >
                        •••
                      </button>
                    </div>
                    <h3>{goal.name}</h3>
                    <div className="progress-meta">
                      <span>
                        {formatCurrency(goalBalance)}{" "}
                        <b className="goal-target">
                          / {formatCurrency(goal.target)}
                        </b>
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${goal.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="goal-bottom">
                      <strong>{percent}%</strong>
                      <span>
                        {percent === 100
                          ? "Objetivo alcançado"
                          : `${formatCurrency(Math.max(0, goal.target - goalBalance))} restantes`}
                      </span>
                    </div>
                  </article>
                );
              })}
              <button
                className="add-goal-card"
                onClick={() => setModal("goal")}
              >
                <span>
                  <Plus size={20} />
                </span>
                <strong>Criar novo objetivo</strong>
                <small>Uma meta de cada vez.</small>
              </button>
            </section>
          </section>
        )}

        {activeTab === "profile" && !showTransactions && (
          <section className="screen-section profile-screen">
            <div className="screen-heading">
              <span className="eyebrow">Seu espaço</span>
              <h2>Meu perfil</h2>
              <p>Atualize suas informações pessoais.</p>
            </div>
            <div className="profile-edit-panel">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-large">
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.name} />
                  ) : (
                    profile.name
                      .split(" ")
                      .map((part: string) => part[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>
                <label
                  className="avatar-edit-button"
                  aria-label="Alterar foto de perfil"
                >
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      updateProfilePhoto(event.target.files?.[0])
                    }
                  />
                </label>
              </div>
              <div className="profile-name-field">
                <label htmlFor="profile-name">Nome</label>
                <input
                  id="profile-name"
                  name="name"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current: { name: string; photo: string }) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </section>
        )}

        {showTransactions && (
          <section className="screen-section transactions-screen">
            <button
              className="back-button"
              onClick={() => setShowTransactions(false)}
            >
              <ArrowLeft size={17} /> Voltar
            </button>
            <div className="screen-heading">
              <span className="eyebrow">Acompanhe de perto</span>
              <h2>Todas as movimentações</h2>
              <p>Seu histórico financeiro, organizado por data.</p>
            </div>
            <div className="movement-summary">
              <div>
                <span>
                  <i className="income-dot" /> Total de ganhos
                </span>
                <strong>{formatCurrency(income)}</strong>
              </div>
              <div>
                <span>
                  <i className="withdrawal-dot" /> Total de retiradas
                </span>
                <strong>{formatCurrency(withdrawals)}</strong>
              </div>
            </div>
            <div className="movement-toolbar">
              <span className="eyebrow">Filtrar por categoria</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option>Todas</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="all-transactions-list">
              {filteredTransactions.length ? (
                filteredTransactions.map((transaction) => (
                  <div className="transaction" key={transaction.id}>
                    <span className={`transaction-icon ${transaction.type}`}>
                      <CategoryIconView icon={transaction.icon} />
                    </span>
                    <div className="transaction-info">
                      <strong>{transaction.title}</strong>
                      <span>
                        {transaction.category} · {transaction.date}
                      </span>
                    </div>
                    <strong
                      className={`transaction-amount ${transaction.type}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}{" "}
                      {formatCurrency(transaction.amount)}
                    </strong>
                    <div className="transaction-actions">
                      <button
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setModal("edit");
                        }}
                        aria-label={`Editar ${transaction.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteTransaction(transaction)}
                        aria-label={`Apagar ${transaction.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhuma movimentação encontrada.</p>
              )}
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        <button
          className={activeTab === "goals" ? "active" : ""}
          onClick={() => navigateTo("goals")}
        >
          <ListChecks
            size={21}
            strokeWidth={activeTab === "goals" ? 2.5 : 1.8}
          />
          <span>Objetivos</span>
        </button>
        <button
          className={`home-tab ${activeTab === "home" ? "active" : ""}`}
          onClick={() => navigateTo("home")}
          aria-label="Início"
        >
          <span>
            <House
              size={21}
              fill="none"
              strokeWidth={activeTab === "home" ? 2.4 : 1.8}
            />
          </span>
          <span>Início</span>
        </button>
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => navigateTo("profile")}
        >
          <CircleUserRound
            size={21}
            strokeWidth={activeTab === "profile" ? 2.5 : 1.8}
          />
          <span>Perfil</span>
        </button>
      </nav>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setModal(null)}
              aria-label="Fechar"
            >
              <X size={19} />
            </button>
            <span className="eyebrow">
              {modal === "goal" || modal === "goal-edit"
                ? "Planeje o próximo passo"
                : modal === "edit"
                  ? "Ajuste os detalhes"
                  : "Atualize seu saldo"}
            </span>
            <h2>
              {modal === "goal"
                ? "Novo objetivo"
                : modal === "goal-edit"
                  ? "Editar objetivo"
                  : modal === "edit"
                    ? "Editar movimentação"
                    : modal === "income"
                      ? "Adicionar ganho"
                      : "Retirar dinheiro"}
            </h2>
            {modal === "goal" || modal === "goal-edit" ? (
              <form onSubmit={saveGoal}>
                <label>
                  Nome do objetivo
                  <input
                    name="name"
                    defaultValue={editingGoal?.name}
                    placeholder="Ex.: Curso de fotografia"
                    autoFocus
                  />
                </label>
                <label>
                  Valor alvo
                  <input
                    name="target"
                    type="number"
                    min="1"
                    step="0.01"
                    defaultValue={editingGoal?.target}
                    placeholder="0,00"
                  />
                </label>
                <div className="appearance-choice">
                  <span className="field-label">Ícone do objetivo</span>
                  <div className="category-icon-picker goal-icon-picker">
                    {goalIcons.map((goalIcon) => (
                      <label className="category-icon-option" key={goalIcon.value}>
                        <input
                          type="radio"
                          name="goalIcon"
                          value={goalIcon.value}
                          defaultChecked={(editingGoal?.icon || "target") === goalIcon.value}
                        />
                        <GoalIconView icon={goalIcon.value} size={18} />
                        <span>{goalIcon.label}</span>
                      </label>
                    ))}
                    <label className="category-icon-option image-icon-option">
                      <ImageIcon size={18} />
                      <span>Imagem</span>
                      <input name="goalImage" type="file" accept="image/*" />
                    </label>
                  </div>
                </div>
                <div className="goal-modal-actions">
                  <button className="primary-button" type="submit">
                    {modal === "goal-edit"
                      ? "Salvar alterações"
                      : "Criar objetivo"}{" "}
                    <Check size={17} />
                  </button>
                  {modal === "goal-edit" && editingGoal && (
                    <button
                      className="delete-goal-button"
                      type="button"
                      onClick={() => deleteGoal(editingGoal)}
                    >
                      Apagar objetivo <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={submitMovement}>
                <label>
                  Descrição
                  <input
                    name="title"
                    defaultValue={editingTransaction?.title}
                    placeholder={
                      modal === "income" ? "Ex.: Salário" : "Ex.: Conta de luz"
                    }
                    autoFocus
                  />
                </label>
                <label>
                  Categoria
                  <input
                    name="category"
                    defaultValue={editingTransaction?.category}
                    placeholder="Ex.: Trabalho"
                  />
                </label>
                <label>
                  Ícone da categoria
                  <div className="category-icon-picker">
                    {categoryIcons.map((categoryIcon) => (
                      <label
                        className="category-icon-option"
                        key={categoryIcon.value}
                      >
                        <input
                          type="radio"
                          name="categoryIcon"
                          value={categoryIcon.value}
                          defaultChecked={
                            (editingTransaction?.icon || "tag") ===
                            categoryIcon.value
                          }
                        />
                        <CategoryIconView icon={categoryIcon.value} size={18} />
                        <span>{categoryIcon.label}</span>
                      </label>
                    ))}
                    <label className="category-icon-option image-icon-option">
                      <ImageIcon size={18} />
                      <span>Imagem</span>
                      <input name="categoryImage" type="file" accept="image/*" />
                    </label>
                  </div>
                </label>
                <label>
                  Valor
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    defaultValue={editingTransaction?.amount}
                    placeholder="0,00"
                  />
                </label>
                <button
                  className={`primary-button ${modal === "withdrawal" ? "danger" : ""}`}
                  type="submit"
                >
                  {modal === "edit"
                    ? "Salvar alterações"
                    : "Salvar movimentação"}{" "}
                  <Check size={17} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
