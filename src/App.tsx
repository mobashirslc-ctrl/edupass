import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
// Firebase Configuration & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyCzyw3OXKIyZ3Gpbrgp9FLV-xu7wMZu7gs",
  authDomain: "counselor-hub.firebaseapp.com",
  projectId: "counselor-hub",
  storageBucket: "counselor-hub.firebasestorage.app",
  messagingSenderId: "724916560626",
  appId: "1:724916560626:web:7a0e6e653240267c4b266b",
  measurementId: "G-EN7CY4H1BE"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
type Page = 'dashboard' | 'training' | 'knowledge' | 'quiz' | 'reports' | 'analytics' | 'admin' | 'monthly-report'
type IconName =
  | 'grid'
  | 'book'
  | 'file'
  | 'quiz'
  | 'report'
  | 'chart'
  | 'settings'
  | 'search'
  | 'bell'
  | 'logout'
  | 'chevron'
  | 'arrow'
  | 'download'
  | 'close'
  | 'clock'
  | 'check'
  | 'users'
  | 'target'
  | 'upload'
  | 'plus'
  | 'calendar'
  | 'edit'
  | 'lock'
  | 'spark'
  | 'menu'
const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" /><path d="M8 7h8M8 11h6" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  quiz: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2 1-1.2 1.8M12 17h.01" /></>,
  report: <><path d="M5 3h14v18H5z" /><path d="M9 7h6M9 11h6M9 15h3" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3M21 3v18h-6" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 1 0 7.8" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="1" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  edit: <><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  spark: <path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
}
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo-crop ${light ? 'logo-light' : ''}`}>
      <img 
        src="https://res.cloudinary.com/ddziennkh/image/upload/v1792414927/Artboard_2_olhclt.png" 
        alt="Eduaimers — Pathway to right goals" 
      />
    </div>
  )
}
function Button({ children, variant = 'primary', icon, onClick, type = 'button', disabled = false, full = false }: {
  children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'; icon?: IconName; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; full?: boolean
}) {
  return <button className={`btn btn-${variant} ${full ? 'btn-full' : ''}`} type={type} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={17} />}{children}</button>
}
function Field({ label, placeholder, type = 'text', defaultValue, value, suffix, onChange }: {
  label?: string; placeholder?: string; type?: string; defaultValue?: string | number; value?: string | number; suffix?: ReactNode; onChange?: (value: string) => void
}) {
  return <label className="field">{label && <span>{label}</span>}<span className="input-wrap"><input type={type} placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={(e) => onChange?.(e.target.value)} />{suffix}</span></label>
}
const fallbackMaterials = [
  { country: 'United Kingdom', flag: '🇬🇧', title: 'UK Admissions Masterclass', meta: '32 pages · Updated 2 days ago', color: 'blue', fileUrl: '#' },
  { country: 'Australia', flag: '🇦🇺', title: 'Australia Student Visa Guide', meta: '28 pages · Updated Oct 12', color: 'amber', fileUrl: '#' },
  { country: 'Canada', flag: '🇨🇦', title: 'Canada Counseling Playbook', meta: '41 pages · Updated Oct 08', color: 'red', fileUrl: '#' },
  { country: 'Spain', flag: '🇪🇸', title: 'Spain Application Essentials', meta: '24 pages · Updated today', color: 'gold', fileUrl: '#' },
]
function Login({ onLogin }: { onLogin: (userType: 'counselor' | 'admin', name?: string, email?: string) => void }) {
  const [role, setRole] = useState<'counselor' | 'admin'>('counselor')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (role === 'admin') {
      if (email.trim().toLowerCase() !== 'admin@eduaimers.com' || password !== 'admin2026') {
        alert("Invalid Admin Email or Password! Access Denied.")
        return
      }
      onLogin('admin', 'Admin Team', email.trim().toLowerCase())
    } else {
      if (!email.trim() || !password.trim()) {
        alert("Please enter both Email and Password!")
        return
      }
      try {
        const querySnapshot = await getDocs(collection(db, "counselors"))
        const counselorList = querySnapshot.docs.map(d => d.data())
        const match = counselorList.find((c: any) => 
          c.email?.trim().toLowerCase() === email.trim().toLowerCase() && 
          c.password === password
        )
        if (!match) {
          alert("Wrong Credentials! No counselor account matches this Email and Password.")
          return
        }
        onLogin('counselor', match.name || 'Counselor', match.email?.trim().toLowerCase())
      } catch (err) {
        alert("Authentication failed. Please check internet connection.")
      }
    }
  }
  return <main className="login-page">
    <section className="login-story">
      <div className="story-glow" />
      <Logo light />
      <div className="story-copy">
        <span className="eyebrow eyebrow-light"><Icon name="spark" size={16} /> EDUAIMERS COUNSELOR HUB</span>
        <h1>Empower every student’s global journey.</h1>
        <p>Your all-in-one resource center for training, knowledge, performance, and team growth.</p>
      </div>
      <div className="world-lines" aria-hidden="true"><span>✦</span></div>
      <p className="login-foot">INTERNAL TEAM PORTAL · EDUAIMERS BD</p>
    </section>
    <section className="login-panel">
      <form className="login-card" onSubmit={submit}>
        <div className="login-mobile-logo"><Logo /></div>
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Sign in to your workspace</h2>
        
        <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '6px', borderRadius: '8px', margin: '15px 0 20px' }}>
          <button 
            type="button" 
            onClick={() => setRole('counselor')} 
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: role === 'counselor' ? '#2563eb' : 'transparent', color: role === 'counselor' ? '#fff' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
          >
            As Counselor
          </button>
          <button 
            type="button" 
            onClick={() => setRole('admin')} 
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: role === 'admin' ? '#2563eb' : 'transparent', color: role === 'admin' ? '#fff' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
          >
            As Admin Team
          </button>
        </div>
        <Field 
          label={role === 'counselor' ? "Counselor Email (Issued by Admin)" : "Admin Email"} 
          type="email" 
          placeholder="name@eduaimers.com" 
          value={email}
          onChange={(v) => setEmail(v)} 
        />
        <Field 
          label={role === 'counselor' ? "Password (Issued by Admin)" : "Admin Password"} 
          type={showPassword ? 'text' : 'password'} 
          placeholder="Password"
          value={password}
          onChange={(v) => setPassword(v)}
          suffix={<button type="button" className="inline-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>} 
        />
        <div className="login-options"><label className="check-label"><input type="checkbox" defaultChecked /> Remember me</label></div>
        <Button type="submit" full>Sign in as {role === 'counselor' ? 'Counselor' : 'Admin'} <Icon name="arrow" size={17} /></Button>
      </form>
    </section>
  </main>
}
function Sidebar({ page, setPage, open, close, userRole, userName }: { page: Page; setPage: (page: Page) => void; open: boolean; close: () => void; userRole: string; userName: string }) {
  const go = (target: Page) => { setPage(target); close() }
  return <>
    {open && <button className="sidebar-scrim" onClick={close} aria-label="Close menu" />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo"><Logo light /></div>
      <div className="workspace-pill"><span className="workspace-mark">EC</span><span><small>WORKSPACE</small>Eduaimers Team</span><Icon name="chevron" size={15} /></div>
      <nav className="main-nav">
        <p>WORKSPACE</p>
        {[
          { page: 'dashboard' as Page, label: 'Overview', icon: 'grid' as IconName },
          { page: 'training' as Page, label: 'Training Library', icon: 'book' as IconName },
          { page: 'knowledge' as Page, label: 'Knowledge Base', icon: 'file' as IconName },
          { page: 'quiz' as Page, label: 'Live Quiz Portal', icon: 'quiz' as IconName },
          { page: 'reports' as Page, label: 'Weekly Reports', icon: 'report' as IconName },
          { page: 'analytics' as Page, label: 'KPI & Analytics', icon: 'chart' as IconName },
          { page: 'monthly-report' as Page, label: 'Monthly Report Generator', icon: 'report' as IconName },
        ].map((item) => <button key={item.page} className={page === item.page ? 'active' : ''} onClick={() => go(item.page)}><Icon name={item.icon} /><span>{item.label}</span>{item.page === 'quiz' && <i>LIVE</i>}</button>)}
        {userRole === 'admin' && (
          <>
            <p>MANAGEMENT</p>
            <button className={page === 'admin' ? 'active' : ''} onClick={() => go('admin')}><Icon name="settings" /><span>Admin Control</span><i className="admin-tag">ADMIN</i></button>
          </>
        )}
      </nav>
      <div className="sidebar-user"><div className="avatar">{userName ? userName.slice(0, 2).toUpperCase() : 'CU'}</div><span><strong>{userName || 'Counselor'}</strong><small>{userRole === 'admin' ? 'Admin Role' : 'Counselor'}</small></span></div>
    </aside>
  </>
}
function Header({ page, onMenu, onLogout, tickerText, userName }: { page: Page; onMenu: () => void; onLogout: () => void; tickerText: string; userName: string }) {
  const titles: Record<Page, string> = { dashboard: `Welcome, ${userName}`, training: 'Training Library', knowledge: 'Quick Knowledge Base', quiz: 'Live Quiz Portal', reports: 'Weekly Report', analytics: 'KPI & Analytics', admin: 'Admin Control Panel', 'monthly-report': 'Monthly Strategic Report' }
  
  return <>
    <style>{`
      @keyframes continuousScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ticker-container {
        display: flex;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        position: relative;
      }
      .ticker-track-running {
        display: flex;
        flex-shrink: 0;
        min-width: 200%;
        animation: continuousScroll 45s linear infinite;
        font-weight: 800;
        color: #1e3a8a;
      }
      .ticker-wrapper {
        overflow: hidden;
        width: 100%;
        position: relative;
        background: #eff6ff;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #dbeafe;
      }
      .ticker-item {
        padding-right: 50px;
        display: inline-block;
      }
    `}</style>
    <div className="ticker ticker-wrapper">
      <strong style={{ marginRight: '15px', color: '#2563eb', fontWeight: 900, flexShrink: 0 }}>LIVE UPDATE:</strong>
      <div className="ticker-container">
        <div className="ticker-track-running">
          <span className="ticker-item">{tickerText}</span>
          <span className="ticker-item">{tickerText}</span>
        </div>
      </div>
      <span className="ticker-time" style={{ marginLeft: '15px', fontWeight: 'bold', flexShrink: 0 }}>LIVE</span>
    </div>
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      <div className="page-title"><h2>{titles[page]}</h2><p>Eduaimers Counselor Hub</p></div>
      <div className="top-actions">
        <button className="logout-btn" onClick={onLogout}><Icon name="logout" size={17} /><span>Logout</span></button>
      </div>
    </header>
  </>
}
function PageHeading({ eyebrow, title, copy, children }: { eyebrow?: string; title: string; copy: string; children?: ReactNode }) {
  return <div className="content-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{copy}</p></div>{children && <div className="heading-actions">{children}</div>}</div>
}
function Dashboard({ setPage, openPdf, materials, userName, activeQuiz, reportSettings }: { setPage: (page: Page) => void; openPdf: (title: string, url?: string) => void; materials: any[]; userName: string; activeQuiz: any; reportSettings: any }) {
  const stat = [
    { icon: 'book' as IconName, value: '0h', label: 'Training hours', trend: '0%', note: 'this month', tone: 'blue' },
    { icon: 'quiz' as IconName, value: '0%', label: 'Quiz accuracy', trend: '0%', note: 'this month', tone: 'purple' },
    { icon: 'report' as IconName, value: '0/4', label: 'Reports submitted', trend: 'Pending', note: 'this month', tone: 'green' },
    { icon: 'target' as IconName, value: '0%', label: 'Monthly KPI', trend: '0%', note: 'this month', tone: 'amber' },
  ]
  const displayList = materials.length > 0 ? materials : fallbackMaterials;
  return <div className="page dashboard-page">
    <div className="welcome-band">
      <div>
        <span className="eyebrow eyebrow-light">COUNSELOR PORTAL</span>
        <h1>Welcome, {userName}.</h1>
        <p>Access active training materials, complete assigned quizzes, and submit weekly performance reports.</p>
        <div className="welcome-actions">
          <Button variant="gold" onClick={() => setPage('quiz')}>Join live quiz <Icon name="arrow" size={17} /></Button>
          <Button variant="secondary" onClick={() => setPage('reports')}>Submit weekly report</Button>
          <Button variant="primary" onClick={() => setPage('monthly-report')}>Monthly Report Generator</Button>
        </div>
      </div>
    </div>
    <div className="stats-grid">{stat.map((item) => <article className="stat-card" key={item.label}><div className={`stat-icon ${item.tone}`}><Icon name={item.icon} /></div><div className="stat-main"><p>{item.label}</p><strong>{item.value}</strong></div><span className={`trend ${item.tone}`}>{item.trend}</span><small>{item.note}</small></article>)}</div>
    <div className="dashboard-grid">
      <section className="panel action-panel">
        <div className="panel-head"><div><span className="eyebrow">QUICK ACCESS</span><h3>Training & Knowledge Base</h3></div><button onClick={() => setPage('training')}>View all <Icon name="arrow" size={15} /></button></div>
        <div className="quick-list">
          <button onClick={() => setPage('knowledge')}><span className="quick-icon blue"><Icon name="file" /></span><span><strong>Quick Knowledge Base</strong><small>Visa checklists & guidelines</small></span><Icon name="chevron" /></button>
          <button onClick={() => setPage('reports')}><span className="quick-icon green"><Icon name="report" /></span><span><strong>Weekly Report Window</strong><small>Deadline: {reportSettings?.deadline || 'Oct 27, 2026'} at {reportSettings?.deadlineTime || '18:00'}</small></span><Icon name="chevron" /></button>
          <button onClick={() => setPage('monthly-report')}><span className="quick-icon purple"><Icon name="report" /></span><span><strong>Monthly Performance Report</strong><small>Auto calculations & status badge</small></span><Icon name="chevron" /></button>
        </div>
      </section>
      <aside className="panel schedule-panel">
        <div className="panel-head"><div><span className="eyebrow">SCHEDULE</span><h3>Upcoming Schedule</h3></div><button><Icon name="calendar" size={18} /></button></div>
        <div className="timeline">
          {activeQuiz ? (
            <div className="timeline-item active">
              <time>{activeQuiz.startTime || '15:00'}</time>
              <i />
              <div>
                <span className="tag tag-live">LIVE QUIZ</span>
                <strong>{activeQuiz.title}</strong>
                <small><Icon name="clock" size={13} /> {activeQuiz.startDate} · Scheduled Quiz</small>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '14px', padding: '10px 0' }}>No live quizzes scheduled for today.</p>
          )}
          <div className="timeline-item">
            <time>{reportSettings?.deadlineTime || '18:00'}</time>
            <i />
            <div>
              <span className="tag tag-report">WEEKLY REPORT</span>
              <strong>Report Deadline Window</strong>
              <small><Icon name="clock" size={13} /> {reportSettings?.deadline || '2026-10-27'}</small>
            </div>
          </div>
        </div>
        <Button full onClick={() => setPage('quiz')}>Open live quiz portal <Icon name="arrow" size={16} /></Button>
      </aside>
    </div>
    <div className="section-head"><div><span className="eyebrow">RESOURCES</span><h3>Latest training guides</h3></div><button onClick={() => setPage('training')}>Browse library <Icon name="arrow" size={15} /></button></div>
    <div className="resource-row">{displayList.slice(0, 3).map((item, idx) => <ResourceCard key={idx} item={item} onClick={() => openPdf(item.title, item.fileUrl)} />)}</div>
  </div>
}
function ResourceCard({ item, onClick }: { item: any; onClick: () => void }) {
  return <button className="resource-card" onClick={onClick}><div className="resource-cover blue"><span>{item.flag || '📄'}</span><Icon name="file" size={28} /><i>PDF</i></div><div className="resource-content"><span>{(item.displayCountry || item.country || '').toUpperCase()}</span><h4>{item.title}</h4><p>{item.meta || 'PDF Training Document'}</p><div>Open document <Icon name="arrow" size={15} /></div></div></button>
}
function Training({ openPdf, materials }: { openPdf: (title: string, url?: string) => void; materials: any[] }) {
  const [query, setQuery] = useState('')
  const sourceList = materials.length > 0 ? materials : fallbackMaterials;
  const filtered = sourceList.filter((item) => `${item.country || ''} ${item.title || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="page">
    <PageHeading eyebrow="LEARNING CENTER" title="Training Library" copy="Build country expertise with the latest counselor guides." />
    <div className="filter-bar"><label className="filter-search"><Icon name="search" /><input placeholder="Search training materials..." value={query} onChange={(e) => setQuery(e.target.value)} /></label><span className="result-count">{filtered.length} resources</span></div>
    <div className="resource-grid">{filtered.map((item, idx) => <ResourceCard item={item} key={idx} onClick={() => openPdf(item.title, item.fileUrl)} />)}</div>
    {!filtered.length && <div className="empty-state"><Icon name="search" size={34} /><h3>No materials found</h3></div>}
  </div>
}
const KNOWLEDGE_CATEGORIES = [
  { id: 'moi', badgeNumber: '01', title: 'MOI Accepted Country & University List', description: 'Verified English-medium acceptance policies across partner universities.' },
  { id: 'spouse', badgeNumber: '02', title: 'Spouse Allowed Flight Countries', description: 'Country-by-country dependent and spouse travel eligibility.' },
  { id: 'visa', badgeNumber: '03', title: 'Visa Checklist', description: 'Complete embassy documentation checklist for your selected country.' },
  { id: 'flowchart', badgeNumber: '04', title: 'Application-to-Visa Step Flowchart', description: 'Visual process from first counseling session through visa grant.' },
];
function Knowledge({ kbDocuments }: { kbDocuments: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  return <div className="page">
    <PageHeading eyebrow="QUICK REFERENCE" title="Knowledge Base" copy="Direct access to standard operating documents and guidelines." />
    
    <div className="filter-bar" style={{ marginBottom: '24px' }}>
      <label className="filter-search">
        <Icon name="search" />
        <input placeholder="Search resources, countries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </label>
    </div>
    <div className="knowledge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {KNOWLEDGE_CATEGORIES.map((cat) => {
        const catPdfs = kbDocuments.filter(d => 
          d.categoryId === cat.id && 
          d.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <div className="panel" key={cat.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between', position: 'relative', padding: '24px' }}>
            <span className="pdf-badge" style={{ position: 'absolute', top: '20px', right: '20px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>PDF</span>
            
            <div>
              <span style={{ fontSize: '32px', fontWeight: 'extrabold', color: '#cbd5e1', display: 'block', marginBottom: '10px' }}>{cat.badgeNumber}</span>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>{cat.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{cat.description}</p>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: 'auto' }}>
              {catPdfs.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>No PDFs uploaded in this section yet.</p>
              ) : (
                catPdfs.map((pdf: any) => (
                  <div key={pdf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 500, color: '#334155', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.title}</span>
                    <a 
                      href={pdf.pdfUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Open PDF →
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
}
function Timer({ seconds, onTimeUp }: { seconds: number; onTimeUp: () => void }) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  useEffect(() => { setTimeLeft(seconds) }, [seconds])
  useEffect(() => {
    if (timeLeft <= 0) { onTimeUp(); return }
    const id = window.setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => window.clearInterval(id)
  }, [timeLeft, onTimeUp])
  const hours = Math.floor(timeLeft / 3600)
  const mins = Math.floor((timeLeft % 3600) / 60)
  const secs = timeLeft % 60
  const unit = (value: number, label: string) => <div><strong>{String(value).padStart(2, '0')}</strong><small>{label}</small></div>
  return <div className="timer">{unit(hours, 'HRS')}<span>:</span>{unit(mins, 'MIN')}<span>:</span>{unit(secs, 'SEC')}</div>
}
function Quiz({ activeQuiz, counselorEmail, userName, onScoreSubmit }: { activeQuiz: any; counselorEmail: string; userName: string; onScoreSubmit: (scoreStr: string, scoreData: any) => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [scoreData, setScoreData] = useState<{ correct: number; total: number; percentage: number; pointsEarned: number; totalPoints: number } | null>(null)
  const [now, setNow] = useState(new Date())
  const [isBlocked, setIsBlocked] = useState(false)
  useEffect(() => {
    if (!counselorEmail && !userName) return
    const key = (counselorEmail || userName).toLowerCase().trim()
    const docRef = doc(db, "quiz_attempts", key)
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().submitted) {
        setIsBlocked(true)
        if (docSnap.data().scoreData) {
          setScoreData(docSnap.data().scoreData)
          setSubmitted(true)
        }
      } else {
        setIsBlocked(false)
        setSubmitted(false)
      }
    })
    return () => unsub()
  }, [counselorEmail, userName])
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const targetDateStr = activeQuiz?.startDate ? `${activeQuiz.startDate}T${activeQuiz?.startTime || '00:00'}:00` : null
  const quizStartTime = targetDateStr ? new Date(targetDateStr) : null
  const isUnlocked = !quizStartTime || now >= quizStartTime
  const timerLimitMinutes = Number(activeQuiz?.timer || 20)
  const [testTimeLeft] = useState(timerLimitMinutes * 60)
  const rawQuestions = activeQuiz?.questions && activeQuiz.questions.length > 0 ? activeQuiz.questions : [
    { text: 'What is the updated minimum maintenance period for UK student visa funds?', type: 'mcq', options: ['28 consecutive days', '30 calendar days', '21 working days', '90 consecutive days'], answerKey: '28 consecutive days', points: 2 },
    { text: 'Which documents can support Spain IPREM financial proof?', type: 'checkbox', options: ['Personal bank statement', 'Property valuation only', 'Confirmed scholarship letter', 'Sponsor affidavit'], answerKey: ['Personal bank statement', 'Confirmed scholarship letter', 'Sponsor affidavit'], points: 3 },
    { text: 'Briefly explain counselor first action on incorrect CAS.', type: 'short', answerKey: 'report university', points: 2 }
  ]
  const questionsList = rawQuestions.map((q: any) => {
    const qType = q.type || 'mcq'
    let opts = q.options && Array.isArray(q.options) && q.options.length > 0 ? q.options : ['28 consecutive days', '30 calendar days', '21 working days', '14 working days']
    return {
      ...q,
      type: qType,
      options: opts,
      points: Number(q.points || 2)
    }
  })
  const handleSubmitQuiz = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    
    let earnedPoints = 0
    let totalPoints = 0
    questionsList.forEach((q: any, i: number) => {
      const qPoints = Number(q.points || 2)
      totalPoints += qPoints
      const userAns = answers[`q${i}`]
      if (q.type === 'mcq' || q.type === 'short') {
        if (userAns && String(userAns).trim().toLowerCase() === String(q.answerKey || '').trim().toLowerCase()) {
          earnedPoints += qPoints
        }
      } else if (q.type === 'checkbox') {
        const correctArr = Array.isArray(q.answerKey) ? q.answerKey.map((s: string) => s.trim().toLowerCase()) : []
        const userArr = Array.isArray(userAns) ? userAns.map((s: string) => s.trim().toLowerCase()) : []
        
        if (correctArr.length > 0 && correctArr.length === userArr.length && correctArr.every((val: string) => userArr.includes(val))) {
          earnedPoints += qPoints
        }
      }
    })
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const finalScoreStr = `${percentage}% (${earnedPoints}/${totalPoints} Pts)`
    const newScoreData = { correct: earnedPoints, total: totalPoints, percentage, pointsEarned: earnedPoints, totalPoints }
    setScoreData(newScoreData)
    setSubmitted(true)
    setIsBlocked(true)
    const key = (counselorEmail || userName).toLowerCase().trim()
    try {
      await setDoc(doc(db, "quiz_attempts", key), {
        submitted: true,
        scoreStr: finalScoreStr,
        scoreData: newScoreData,
        submittedAt: new Date().toLocaleString()
      })
      const counselorSnap = await getDocs(collection(db, "counselors"))
      const found = counselorSnap.docs.find(d => {
        const data = d.data()
        return (data.email && data.email.toLowerCase().trim() === key) || (data.name && data.name.toLowerCase().trim() === userName.toLowerCase().trim())
      })
      if (found) {
        await updateDoc(doc(db, "counselors", found.id), {
          score: finalScoreStr
        })
      }
    } catch (err) {
      console.error("Failed to save quiz attempt to cloud:", err)
    }
    onScoreSubmit(finalScoreStr, newScoreData)
  }
  if (isBlocked && submitted) {
    return <QuizResults scoreData={scoreData} quizTitle={activeQuiz?.title} userName={userName} />
  }
  if (isBlocked && !submitted) {
    return <div className="page quiz-page">
      <PageHeading eyebrow="WEEKLY KNOWLEDGE CHECK" title={activeQuiz?.title || "Live Quiz Portal"} copy="Attempt Restriction"><span className="status-pill" style={{ background: '#ef4444' }}><i /> ALREADY SUBMITTED & LOCKED</span></PageHeading>
      <div className="panel" style={{ padding: '40px', textAlign: 'center', marginTop: '30px' }}>
        <Icon name="lock" size={48} />
        <h2 style={{ margin: '20px 0 10px' }}>Quiz Access Restricted</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>You have already completed and submitted this quiz. Reviewing or restarting is locked. Please request Admin access/permission for a re-attempt.</p>
      </div>
    </div>
  }
  if (!isUnlocked && quizStartTime) {
    const diffMs = quizStartTime.getTime() - now.getTime()
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000))
    const hours = Math.floor(diffSecs / 3600)
    const mins = Math.floor((diffSecs % 3600) / 60)
    const secs = diffSecs % 60
    return <div className="page quiz-page">
      <PageHeading eyebrow="WEEKLY KNOWLEDGE CHECK" title={activeQuiz?.title || "Upcoming Live Quiz"} copy="Scheduled Examination Portal"><span className="status-pill" style={{ background: '#f59e0b' }}><i /> LOCKED UNTIL SCHEDULED TIME</span></PageHeading>
      <div className="panel" style={{ padding: '40px', textAlign: 'center', marginTop: '30px' }}>
        <Icon name="lock" size={48} />
        <h2 style={{ margin: '20px 0 10px' }}>Upcoming Quiz</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Scheduled for: <strong>{activeQuiz.startDate} at {activeQuiz.startTime}</strong>. Portal will unlock automatically.</p>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
          Opens in: {String(hours).padStart(2, '0')}h : {String(mins).padStart(2, '0')}m : {String(secs).padStart(2, '0')}s
        </div>
      </div>
    </div>
  }
  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[k]
    if (Array.isArray(val)) return val.length > 0
    return val !== undefined && val !== null && String(val).trim() !== ''
  }).length
  return <div className="page quiz-page">
    <PageHeading eyebrow="WEEKLY KNOWLEDGE CHECK" title={activeQuiz?.title || "Spain & UK Visa Updates"} copy={`Live Assessment · ${questionsList.length} Questions`}><span className="status-pill"><i /> LIVE NOW</span></PageHeading>
    <div className="quiz-timer"><div><span className="timer-icon"><Icon name="clock" size={24} /></span><div><small>TIME REMAINING</small><p>Quiz auto-submits when timer hits zero.</p></div></div><Timer seconds={testTimeLeft} onTimeUp={() => handleSubmitQuiz()} /></div>
    <div className="quiz-layout">
      <form className="question-stack" onSubmit={handleSubmitQuiz}>
        {questionsList.map((q: any, i: number) => (
          <article className="question-card" key={i}>
            <header><span>QUESTION 0{i + 1}</span><i>{q.points} POINTS ({q.type.toUpperCase()})</i></header>
            <h3>{q.text}</h3>
            
            {q.type === 'mcq' && (
              <>
                <p className="question-type">Select one option</p>
                {q.options.map((opt: string, idx: number) => {
                  const isSel = answers[`q${i}`] === opt
                  const labelClass = "answer " + (isSel ? "selected" : "")
                  return (
                    <label className={labelClass} key={idx}>
                      <input type="radio" name={`q${i}`} checked={isSel} onChange={() => setAnswers({ ...answers, [`q${i}`]: opt })} />
                      <span>{String.fromCharCode(65 + idx)}</span>{opt}
                    </label>
                  )
                })}
              </>
            )}
            {q.type === 'checkbox' && (
              <>
                <p className="question-type">Select all that apply (Multiple answers)</p>
                {q.options.map((opt: string, idx: number) => {
                  const selectedArr = answers[`q${i}`] || []
                  const isChecked = Array.isArray(selectedArr) && selectedArr.includes(opt)
                  const labelClass = "answer " + (isChecked ? "selected" : "")
                  return (
                    <label className={labelClass} key={idx}>
                      <input type="checkbox" checked={isChecked} onChange={(e) => {
                        let current = Array.isArray(selectedArr) ? [...selectedArr] : []
                        if (e.target.checked) {
                          current.push(opt)
                        } else {
                          current = current.filter(item => item !== opt)
                        }
                        setAnswers({ ...answers, [`q${i}`]: current })
                      }} />
                      <span><Icon name="check" size={15} /></span>{opt}
                    </label>
                  )
                })}
              </>
            )}
            {q.type === 'short' && (
              <>
                <p className="question-type">Short answer text</p>
                <textarea 
                  placeholder="Type your answer here..." 
                  rows={3}
                  value={answers[`q${i}`] || ''}
                  onChange={(e) => setAnswers({ ...answers, [`q${i}`]: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </>
            )}
          </article>
        ))}
        <div className="submit-strip"><div><Icon name="check" /><span><strong>{answeredCount} of {questionsList.length} answered</strong><small>Answers locked after submission.</small></span></div><Button type="submit" disabled={answeredCount < 1}>Submit quiz instantly <Icon name="arrow" size={16} /></Button></div>
      </form>
      <aside className="quiz-nav panel"><span className="eyebrow">QUIZ PROGRESS</span><h3>Question navigator</h3><div className="question-dots">{questionsList.map((_: any, i: number) => <button key={i} className={answers[`q${i}`] ? 'done' : 'current'}>{i + 1}</button>)}</div><div className="legend"><span><i className="done" /> Answered</span><span><i className="current" /> Current</span><span><i /> Unanswered</span></div><hr /><p><Icon name="lock" size={15} /> Secure exam environment active.</p></aside>
    </div>
  </div>
}
function QuizResults({ scoreData, quizTitle, userName }: { scoreData: any; quizTitle?: string; userName: string }) {
  const downloadScoreCardPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Eduaimers - Score Card - ${userName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0F172A; background: #FFF; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563EB; padding-bottom: 20px; }
          .logo { height: 50px; }
          .title { font-size: 22px; font-weight: bold; color: #1E3A8A; }
          .box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 25px; border-radius: 12px; margin-top: 30px; }
          .score { font-size: 36px; font-weight: 800; color: #2563EB; margin: 15px 0; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://res.cloudinary.com/ddziennkh/image/upload/v1792414927/Artboard_2_olhclt.png" class="logo" />
          <div class="title">OFFICIAL QUIZ SCORE CARD</div>
        </div>
        <div class="box">
          <h2>Candidate: ${userName}</h2>
          <p><strong>Quiz Title:</strong> ${quizTitle || "Live Assessment"}</p>
          <p><strong>Evaluation Date:</strong> ${new Date().toLocaleDateString()}</p>
          <div class="score">${scoreData?.percentage}% Score</div>
          <p><strong>Points Earned:</strong> ${scoreData?.pointsEarned} / ${scoreData?.totalPoints} Total Points</p>
        </div>
        <div class="footer">Verified & Issued by Eduaimers Academic Portal</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
  return <div className="page">
    <div className="results-hero" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)', padding: '40px', borderRadius: '12px', color: '#fff', textAlign: 'center', marginBottom: '30px' }}>
      <div className="score-ring" style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '4px solid #60a5fa' }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{scoreData?.percentage}%</div>
      </div>
      <span className="eyebrow eyebrow-light">INSTANT EVALUATION COMPLETE</span>
      <h1>Great job, {userName}!</h1>
      <p>You earned <strong>{scoreData?.pointsEarned}</strong> out of <strong>{scoreData?.totalPoints}</strong> total points.</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
        <Button variant="gold" icon="download" onClick={downloadScoreCardPDF}>Download Score Card PDF</Button>
        <Button variant="secondary" onClick={() => alert("Admin permission required to re-attempt quiz.")}>Request Admin Re-attempt</Button>
      </div>
    </div>
  </div>
}
const reportMetrics = [
  ['Total calls made', '0'], ['Connected calls', '0'], ['Interested leads', '0'], ['Pending follow-ups', '0'],
  ['Office visits scheduled', '0'], ['Office visits attended', '0'], ['Files opened', '0'], ['Applications submitted', '0'],
  ['Offers received', '0'], ['Visas granted', '0'], ['Revenue / Sales (BDT)', '0'],
]
function Reports({ reportSettings, onReportSubmit, userName, counselorEmail }: { reportSettings: any; onReportSubmit: (data: any, pdfUrl: string, fileName: string) => void; userName: string; counselorEmail: string }) {
  const [preview, setPreview] = useState(false)
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const deadlineStr = reportSettings?.deadline ? `${reportSettings.deadline}T${reportSettings?.deadlineTime || '23:59'}:00` : null
  const deadlineDate = deadlineStr ? new Date(deadlineStr) : null
  
  const isForceClosed = reportSettings?.isClosed === true
  const isForceOpened = reportSettings?.isOpen === true
  
  const isClosed = isForceClosed ? true : isForceOpened ? false : (deadlineDate ? now > deadlineDate : false)
  
  const [weeklyData, setWeeklyData] = useState({
    totalCalls: 120,
    connectedCalls: 95,
    interestedLeads: 25,
    officeVisits: 10,
    filesOpened: 4,
    applicationsSubmitted: 5,
    visasApproved: 2,
    weeklyRevenue: 45000,
    weeklyCost: 10000,
    performanceStatus: 'GOOD 👍',
    challenges: 'Delay in university response for conditional offer letters.',
    solutions: 'Direct follow-up with university international admissions team via priority email.'
  })

  const weeklyProfit = Number(weeklyData.weeklyRevenue) - Number(weeklyData.weeklyCost)

  const getWeeklyPerformanceBadge = (revenue: number, files: number) => {
    if (revenue >= 50000 && files >= 4) return { label: 'EXCELLENT 🔥', color: '#16a34a' }
    if (revenue >= 25000 && files >= 2) return { label: 'GOOD 👍', color: '#2563eb' }
    if (revenue > 0) return { label: 'NOT GOOD ⚠️', color: '#d97706' }
    return { label: 'NEED IMPROVEMENT ❌', color: '#dc2626' }
  }
  const weeklyPerf = getWeeklyPerformanceBadge(Number(weeklyData.weeklyRevenue), Number(weeklyData.filesOpened))

  if (isClosed) {
    return <div className="page">
      <PageHeading eyebrow="WEEKLY PERFORMANCE" title="Submit your weekly report" copy="Time-Restricted Window"><span className="status-pill" style={{ background: '#ef4444' }}><i /> SUBMISSION DEADLINE PASSED</span></PageHeading>
      <div className="panel" style={{ padding: '40px', textAlign: 'center', marginTop: '30px' }}>
        <Icon name="lock" size={48} />
        <h2 style={{ margin: '20px 0 10px' }}>Report Portal Closed</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>The submission deadline set by admin has passed. You can no longer submit your report without Admin re-opening access.</p>
      </div>
    </div>
  }

  return <div className="page">
    <PageHeading eyebrow="WEEKLY PERFORMANCE TEMPLATE" title="Submit your weekly report" copy="Input weekly metrics and generate official PDF summary.">
      <span className="due-date" style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', fontWeight: 600 }}>
        <Icon name="clock" size={16} /> Deadline: {reportSettings?.deadline || 'Oct 27, 2026'} at {reportSettings?.deadlineTime || '18:00'}
      </span>
    </PageHeading>

    <form className="report-form panel" onSubmit={(e) => { e.preventDefault(); setPreview(true) }}>
      <section>
        <div className="form-section-title"><span>01</span><div><h3>Counselor & Period Info</h3><p>Basic tracking parameters</p></div></div>
        <div className="form-grid two">
          <Field label="Counselor Name" value={userName} />
          <Field label="Reporting Period" defaultValue="Oct 19 — Oct 25, 2026" />
        </div>
      </section>

      <section>
        <div className="form-section-title"><span>02</span><div><h3>Weekly Activity, Revenue & Profit Inputs</h3><p>Enter calls, visits, file openings, revenue, cost, and custom status.</p></div></div>
        <div className="form-grid three" style={{ marginBottom: '15px' }}>
          <Field label="Total Calls Made" type="number" value={weeklyData.totalCalls} onChange={(v) => setWeeklyData({ ...weeklyData, totalCalls: Number(v) })} />
          <Field label="Connected Calls" type="number" value={weeklyData.connectedCalls} onChange={(v) => setWeeklyData({ ...weeklyData, connectedCalls: Number(v) })} />
          <Field label="Interested Leads" type="number" value={weeklyData.interestedLeads} onChange={(v) => setWeeklyData({ ...weeklyData, interestedLeads: Number(v) })} />
        </div>
        <div className="form-grid three" style={{ marginBottom: '15px' }}>
          <Field label="Office Visits Attended" type="number" value={weeklyData.officeVisits} onChange={(v) => setWeeklyData({ ...weeklyData, officeVisits: Number(v) })} />
          <Field label="New Files Opened" type="number" value={weeklyData.filesOpened} onChange={(v) => setWeeklyData({ ...weeklyData, filesOpened: Number(v) })} />
          <Field label="Applications Submitted" type="number" value={weeklyData.applicationsSubmitted} onChange={(v) => setWeeklyData({ ...weeklyData, applicationsSubmitted: Number(v) })} />
        </div>
        <div className="form-grid three" style={{ marginBottom: '15px' }}>
          <Field label="Visas Approved" type="number" value={weeklyData.visasApproved} onChange={(v) => setWeeklyData({ ...weeklyData, visasApproved: Number(v) })} />
          <Field label="Weekly Revenue (BDT)" type="number" value={weeklyData.weeklyRevenue} onChange={(v) => setWeeklyData({ ...weeklyData, weeklyRevenue: Number(v) })} />
          <Field label="Weekly Cost / Expenses (BDT)" type="number" value={weeklyData.weeklyCost} onChange={(v) => setWeeklyData({ ...weeklyData, weeklyCost: Number(v) })} />
        </div>
        <div className="form-grid two">
          <label className="field">
            <span>Performance Status (Editable)</span>
            <select 
              value={weeklyData.performanceStatus} 
              onChange={(e) => setWeeklyData({ ...weeklyData, performanceStatus: e.target.value })} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', background: '#fff' }}
            >
              <option value="EXCELLENT 🔥">EXCELLENT 🔥</option>
              <option value="GOOD 👍">GOOD 👍</option>
              <option value="NOT GOOD ⚠️">NOT GOOD ⚠️</option>
              <option value="NEED IMPROVEMENT ❌">NEED IMPROVEMENT ❌</option>
            </select>
          </label>
        </div>
      </section>

      <section>
        <div className="form-section-title"><span>03</span><div><h3>Challenges & Solutions</h3><p>Operational challenges faced and solutions applied.</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Challenges Faced</span><textarea rows={3} value={weeklyData.challenges} onChange={(e) => setWeeklyData({ ...weeklyData, challenges: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></label>
          <label className="field"><span>Solutions Applied</span><textarea rows={3} value={weeklyData.solutions} onChange={(e) => setWeeklyData({ ...weeklyData, solutions: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></label>
        </div>
      </section>

      <footer className="form-footer"><p><Icon name="check" size={16} /> Ready to preview & download PDF</p><Button type="submit">Preview Weekly Report <Icon name="arrow" size={16} /></Button></footer>
    </form>

    {preview && <ReportPreview weeklyData={{ ...weeklyData, weeklyProfit }} weeklyPerf={weeklyPerf} userName={userName} counselorEmail={counselorEmail} onClose={() => setPreview(false)} onSubmitSuccess={(pdfUrl, fileName) => {
      onReportSubmit(weeklyData, pdfUrl, fileName)
      setPreview(false)
      alert("Weekly report submitted successfully with PDF download support!")
    }} />}
  </div>
}

function ReportPreview({ weeklyData, weeklyPerf, userName, counselorEmail, onClose, onSubmitSuccess }: { weeklyData: any; weeklyPerf: any; userName: string; counselorEmail: string; onClose: () => void; onSubmitSuccess: (url: string, name: string) => void }) {
  const [submitting, setSubmitting] = useState(false)

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly-Report-${userName}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E293B; margin: 0; padding: 25px; background: #FFF; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563EB; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { height: 50px; }
          .header-title h2 { margin: 0; color: #1E3A8A; font-size: 16px; text-transform: uppercase; }
          .header-title p { margin: 3px 0 0; color: #64748B; font-size: 10px; }
          .info-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-item small { display: block; color: #64748B; font-size: 10px; text-transform: uppercase; font-weight: bold; }
          .info-item strong { font-size: 13px; color: #0F172A; }
          .badge-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .badge { padding: 4px 10px; font-weight: bold; color: #fff; background: ${weeklyPerf.color}; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
          .section-heading { font-size: 12px; font-weight: bold; color: #2563EB; text-transform: uppercase; margin-bottom: 8px; border-left: 3px solid #2563EB; padding-left: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1E3A8A; color: #FFFFFF; text-align: left; padding: 7px 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          td { border-bottom: 1px solid #E2E8F0; padding: 7px 10px; font-size: 11px; color: #334155; }
          tr:nth-child(even) td { background: #F8FAFC; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-top: 1px solid #CBD5E1; }
          .sig-box { text-align: center; width: 200px; }
          .sig-line { border-top: 1px solid #1E293B; margin-top: 40px; margin-bottom: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://res.cloudinary.com/ddziennkh/image/upload/v1792414927/Artboard_2_olhclt.png" class="logo" />
          <div class="header-title" style="text-align: right;">
            <h2>Weekly Performance Report</h2>
            <p>Eduaimers Counselor Hub</p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-item"><small>Counselor</small><strong>${userName}</strong></div>
          <div class="info-item"><small>Email</small><strong>${counselorEmail}</strong></div>
          <div class="info-item"><small>Report Date</small><strong>${new Date().toLocaleDateString()}</strong></div>
        </div>
        <div class="badge-box">
          <div>
            <small style="color: #64748B; font-size: 10px; font-weight: bold;">FINANCIAL SUMMARY</small>
            <strong style="font-size: 13px; color: #2563EB;">Rev: ৳ ${Number(weeklyData.weeklyRevenue).toLocaleString()} | Profit: ৳ ${Number(weeklyData.weeklyProfit).toLocaleString()}</strong>
          </div>
          <div><span class="badge">${weeklyData.performanceStatus}</span></div>
        </div>
        <div class="section-heading">01. Weekly Activity & Financial Metrics</div>
        <table>
          <thead>
            <tr>
              <th>Performance Key Indicator</th>
              <th style="text-align: right;">Reported Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Total Calls Made</td><td style="text-align: right; font-weight: bold;">${weeklyData.totalCalls}</td></tr>
            <tr><td>Connected Calls</td><td style="text-align: right; font-weight: bold;">${weeklyData.connectedCalls}</td></tr>
            <tr><td>Interested Leads</td><td style="text-align: right; font-weight: bold;">${weeklyData.interestedLeads}</td></tr>
            <tr><td>Office Visits Attended</td><td style="text-align: right; font-weight: bold;">${weeklyData.officeVisits}</td></tr>
            <tr><td>New Files Opened</td><td style="text-align: right; font-weight: bold; color: #2563EB;">${weeklyData.filesOpened}</td></tr>
            <tr><td>Applications Submitted</td><td style="text-align: right; font-weight: bold;">${weeklyData.applicationsSubmitted}</td></tr>
            <tr><td>Visas Approved</td><td style="text-align: right; font-weight: bold; color: #16a34a;">${weeklyData.visasApproved}</td></tr>
            <tr><td>Weekly Revenue Generated</td><td style="text-align: right; font-weight: bold; color: #2563EB;">৳ ${Number(weeklyData.weeklyRevenue).toLocaleString()}</td></tr>
            <tr><td>Weekly Net Profit</td><td style="text-align: right; font-weight: bold; color: #16a34a;">৳ ${Number(weeklyData.weeklyProfit).toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div class="section-heading">02. Challenges & Solutions</div>
        <p style="font-size: 11px; background: #F8FAFC; padding: 8px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>Challenges:</strong> ${weeklyData.challenges}</p>
        <p style="font-size: 11px; background: #F8FAFC; padding: 8px; border-radius: 4px; border: 1px solid #E2E8F0; margin-top: 5px;"><strong>Solutions:</strong> ${weeklyData.solutions}</p>
        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>${userName}</strong>
            <small style="display: block; color: #64748B; font-size: 10px;">Counselor Signature</small>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <strong>Mobashir Ahmed Nasrullah</strong>
            <small style="display: block; color: #64748B; font-size: 10px;">Business Development Officer</small>
          </div>
        </div>
        <div class="footer">
          Eduaimers Study Abroad Agency • House-12, 2nd Floor, Ring Road, Shyamoli, Dhaka-1207 • Official Weekly Report
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    const dateStamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const fileName = `Weekly-Report-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`
    
    try {
      const reportItem = {
        id: Date.now().toString(),
        weekEndingDate: dateStamp,
        fileName: fileName,
        submittedAt: new Date().toLocaleString(),
        metrics: weeklyData
      }
      const counselorSnap = await getDocs(collection(db, "counselors"))
      const cleanUserEmail = (counselorEmail || '').trim().toLowerCase()
      const foundDoc = counselorSnap.docs.find(d => {
        const dEmail = (d.data().email || '').trim().toLowerCase()
        const dName = (d.data().name || '').trim().toLowerCase()
        return dEmail === cleanUserEmail || (dName === userName.trim().toLowerCase())
      })
      if (foundDoc) {
        const existingData = foundDoc.data()
        const history = existingData.reportsHistory || []
        await updateDoc(doc(db, "counselors", foundDoc.id), {
          reportsHistory: [reportItem, ...history]
        })
      }
      handleDownloadPDF();
      onSubmitSuccess('#', fileName)
    } catch (e) {
      console.error("Error saving report history:", e)
      handleDownloadPDF();
      onSubmitSuccess('#', fileName)
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="modal-layer">
    <button className="modal-scrim" onClick={onClose} aria-label="Close preview" />
    <div className="report-modal">
      <header><div><span className="success-icon"><Icon name="check" /></span><div><h2>Weekly Report Preview</h2><p>Review summary with editable profit, status, and PDF download support.</p></div></div><button className="icon-btn" onClick={onClose}><Icon name="close" /></button></header>
      <div className="report-paper">
        <div className="paper-head"><Logo /><div><small>WEEKLY REPORT SUMMARY</small><strong>Profit: ৳ {Number(weeklyData.weeklyProfit).toLocaleString()}</strong></div></div>
        <div className="paper-person"><span className="avatar">{userName ? userName.slice(0, 2).toUpperCase() : 'CU'}</span><div><small>COUNSELOR</small><strong>{userName}</strong></div><span><small>STATUS</small><strong style={{ color: weeklyPerf.color }}>{weeklyData.performanceStatus}</strong></span></div>
        <div className="paper-metrics">{[[weeklyData.totalCalls, 'Total calls'], [weeklyData.connectedCalls, 'Connected'], [weeklyData.filesOpened, 'Files opened'], [weeklyData.visasApproved, 'Visas approved'], [`৳${weeklyData.weeklyProfit}`, 'Net Profit']].map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
      </div>
      <footer>
        <Button variant="secondary" onClick={onClose}>Back to edit</Button>
        <Button variant="gold" icon="download" onClick={handleDownloadPDF}>Download PDF Report</Button>
        <Button onClick={handleFinalSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit & Download PDF'}</Button>
      </footer>
    </div>
  </div>
}
// Monthly Report Generator Component with Digital Marketing & Counselor KPI
function MonthlyReportGenerator() {
  const [formData, setFormData] = useState({
    agencyName: 'EduAimers BD',
    monthYear: 'October 2026',
    preparedBy: 'Mobashir Ahmed Nasrullah',
    executiveSummary: 'Strong performance across digital marketing, counselor productivity, and revenue growth.',
    // Financials
    fileFeeRevenue: 200000,
    uniCommission: 450000,
    subAgentPayouts: 70000,
    refunds: 15000,
    marketingCosts: 60000,
    // Challenges & Solutions
    challenges: '1. Visa refusal or delays in specific destination countries.\n2. Lower-than-expected lead-to-file conversion rate during mid-month.',
    solutions: '1. Conduct pre-screening financial verification before university submission.\n2. Intensive follow-up training for telemarketing and counselors.',
    // Next Month Targets
    nextMonthTargetRevenue: 850000,
    nextMonthTargetFiles: 35,
    strategicFocus: '1. Focus on UK and Canada intake admissions.\n2. Expand sub-agent partner networks across regional districts.'
  })

  // Per Counselor Performance List state with KPI metrics
  const [counselors, setCounselors] = useState([
    { name: 'Counselor 1', totalCalls: 250, totalVisits: 45, convertingNumber: 15, fileOpening: 8, revenueEarned: 120000, punctuality: '95%', grooming: 'Excellent', quizScore: '85%' },
    { name: 'Counselor 2', totalCalls: 210, totalVisits: 38, convertingNumber: 12, fileOpening: 6, revenueEarned: 95000, punctuality: '90%', grooming: 'Good', quizScore: '78%' },
  ])

  const [newCName, setNewCName] = useState('')
  const [newCCalls, setNewCCalls] = useState(0)
  const [newCVisits, setNewCVisits] = useState(0)
  const [newCConv, setNewCConv] = useState(0)
  const [newCFiles, setNewCFiles] = useState(0)
  const [newCRev, setNewCRev] = useState(0)
  const [newCPunctuality, setNewCPunctuality] = useState('95%')
  const [newCGrooming, setNewCGrooming] = useState('Good')
  const [newCQuiz, setNewCQuiz] = useState('80%')

  const handleAddCounselor = () => {
    if (!newCName.trim()) return
    setCounselors([
      ...counselors,
      { 
        name: newCName, 
        totalCalls: Number(newCCalls), 
        totalVisits: Number(newCVisits), 
        convertingNumber: Number(newCConv), 
        fileOpening: Number(newCFiles), 
        revenueEarned: Number(newCRev),
        punctuality: newCPunctuality,
        grooming: newCGrooming,
        quizScore: newCQuiz
      }
    ])
    setNewCName('')
    setNewCCalls(0)
    setNewCVisits(0)
    setNewCConv(0)
    setNewCFiles(0)
    setNewCRev(0)
  }

  // Digital Marketing Campaigns state
  const [campaigns, setCampaigns] = useState([
    { campaignName: 'UK September Intake FB Boost', totalBoostCost: 15000, totalReach: 45000, responses: 120, roi: '3.5x', status: 'GOOD' },
    { campaignName: 'Canada Visa Success TikTok Ad', totalBoostCost: 10000, totalReach: 30000, responses: 90, roi: '4.2x', status: 'SUPER' }
  ])

  const [newCampName, setNewCampName] = useState('')
  const [newCampCost, setNewCampCost] = useState(0)
  const [newCampReach, setNewCampReach] = useState(0)
  const [newCampResp, setNewCampResp] = useState(0)
  const [newCampRoi, setNewCampRoi] = useState('3.0x')
  const [newCampStatus, setNewCampStatus] = useState('GOOD')

  const handleAddCampaign = () => {
    if (!newCampName.trim()) return
    setCampaigns([
      ...campaigns,
      {
        campaignName: newCampName,
        totalBoostCost: Number(newCampCost),
        totalReach: Number(newCampReach),
        responses: Number(newCampResp),
        roi: newCampRoi,
        status: newCampStatus
      }
    ])
    setNewCampName('')
    setNewCampCost(0)
    setNewCampReach(0)
    setNewCampResp(0)
  }

  // Auto Calculations
  const totalRevenue = Number(formData.fileFeeRevenue) + Number(formData.uniCommission)
  const totalCosts = Number(formData.subAgentPayouts) + Number(formData.refunds) + Number(formData.marketingCosts)
  const netProfit = totalRevenue - totalCosts

  const totalBoostSpent = campaigns.reduce((acc, c) => acc + Number(c.totalBoostCost), 0)
  const totalCampaignReach = campaigns.reduce((acc, c) => acc + Number(c.totalReach), 0)

  // Performance Rating Logic
  const getPerformanceStatus = (profit: number) => {
    if (profit >= 450000) return { label: 'SUPER 🔥', color: '#16a34a' }
    if (profit >= 250000) return { label: 'GOOD 👍', color: '#2563eb' }
    if (profit >= 80000) return { label: 'NOT GOOD ⚠️', color: '#d97706' }
    return { label: 'BAD ❌', color: '#dc2626' }
  }

  const performance = getPerformanceStatus(netProfit)

  // Helper for KPI Rating Badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'EXCELLENT': case 'SUPER': return '#16a34a'
      case 'GOOD': return '#2563eb'
      case 'NOT GOOD': return '#d97706'
      default: return '#dc2626'
    }
  }

  const handleGenerateMonthlyReportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Business Performance & Strategic Report</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E293B; margin: 0; padding: 20px; background: #FFF; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563EB; padding-bottom: 12px; margin-bottom: 15px; }
          .logo { height: 45px; }
          .title-area h2 { margin: 0; color: #1E3A8A; font-size: 16px; text-transform: uppercase; }
          .title-area p { margin: 3px 0 0; color: #64748B; font-size: 10px; }
          
          .badge-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .badge { padding: 5px 12px; font-weight: bold; color: #fff; background: ${performance.color}; border-radius: 4px; font-size: 13px; text-transform: uppercase; }
          
          .section-heading { font-size: 12px; font-weight: bold; color: #2563EB; text-transform: uppercase; margin: 15px 0 8px; border-left: 3px solid #2563EB; padding-left: 6px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th { background: #1E3A8A; color: #FFFFFF; text-align: left; padding: 7px 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          td { border-bottom: 1px solid #E2E8F0; padding: 7px 10px; font-size: 11px; color: #334155; }
          tr:nth-child(even) td { background: #F8FAFC; }
          .footer { margin-top: 25px; text-align: center; font-size: 10px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://res.cloudinary.com/ddziennkh/image/upload/v1792414927/Artboard_2_olhclt.png" class="logo" />
          <div class="title-area" style="text-align: right;">
            <h2>Monthly Business & Strategic Report</h2>
            <p>Agency: ${formData.agencyName} | Month: ${formData.monthYear}</p>
          </div>
        </div>

        <div class="badge-box">
          <div>
            <small style="display: block; color: #64748B; font-size: 9px; text-transform: uppercase; font-weight: bold;">Prepared By</small>
            <strong style="font-size: 13px;">${formData.preparedBy}</strong>
          </div>
          <div>
            <small style="display: block; color: #64748B; font-size: 9px; text-transform: uppercase; font-weight: bold; text-align: right;">Monthly Rating</small>
            <span class="badge">${performance.label}</span>
          </div>
        </div>

        <div class="section-heading">Executive Summary</div>
        <p style="font-size: 11px; background: #F8FAFC; padding: 8px; border-radius: 4px; border: 1px solid #E2E8F0;">${formData.executiveSummary}</p>

        <div class="section-heading">1. Per Counselor Performance & KPI Breakdown</div>
        <table>
          <tr>
            <th>Counselor Name</th>
            <th style="text-align: right;">Calls / Visits</th>
            <th style="text-align: right;">Converting / Files</th>
            <th style="text-align: right;">Revenue Earned</th>
            <th style="text-align: center;">Punctuality</th>
            <th style="text-align: center;">Grooming</th>
            <th style="text-align: center;">Quiz Score</th>
          </tr>
          ${counselors.map(c => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td style="text-align: right;">${c.totalCalls} / ${c.totalVisits}</td>
              <td style="text-align: right;">${c.convertingNumber} / <b>${c.fileOpening}</b></td>
              <td style="text-align: right; color: #2563EB; font-weight: bold;">৳ ${c.revenueEarned.toLocaleString()}</td>
              <td style="text-align: center;">${c.punctuality}</td>
              <td style="text-align: center;">${c.grooming}</td>
              <td style="text-align: center; font-weight: bold;">${c.quizScore}</td>
            </tr>
          `).join('')}
        </table>

        <div class="section-heading">2. Digital Marketing & Boosting Performance</div>
        <table>
          <tr>
            <th>Campaign / Boost Name</th>
            <th style="text-align: right;">Cost (BDT)</th>
            <th style="text-align: right;">Total Reach</th>
            <th style="text-align: right;">Responses</th>
            <th style="text-align: right;">ROI</th>
            <th style="text-align: center;">Status</th>
          </tr>
          ${campaigns.map(camp => `
            <tr>
              <td><strong>${camp.campaignName}</strong></td>
              <td style="text-align: right;">৳ ${camp.totalBoostCost.toLocaleString()}</td>
              <td style="text-align: right;">${camp.totalReach.toLocaleString()}</td>
              <td style="text-align: right;">${camp.responses}</td>
              <td style="text-align: right; font-weight: bold; color: #16a34a;">${camp.roi}</td>
              <td style="text-align: center; font-weight: bold; color: #2563eb;">${camp.status}</td>
            </tr>
          `).join('')}
        </table>
        <p style="font-size: 11px;"><strong>Total Boost Spent:</strong> ৳ ${totalBoostSpent.toLocaleString()} | <strong>Total Reach:</strong> ${totalCampaignReach.toLocaleString()}</p>

        <div class="section-heading">3. Financial Overview (Auto-Calculated)</div>
        <table>
          <tr><th>Financial Metric</th><th style="text-align: right;">Amount (BDT)</th></tr>
          <tr><td>Revenue from File Fees & Commissions</td><td style="text-align: right; font-weight: bold; color: #2563EB;">৳ ${totalRevenue.toLocaleString()}</td></tr>
          <tr><td>Total Costs (Payouts + Refunds + Marketing)</td><td style="text-align: right;">৳ ${totalCosts.toLocaleString()}</td></tr>
          <tr><td><strong>Net Profit / Loss</strong></td><td style="text-align: right; font-weight: bold; color: ${netProfit >= 0 ? '#16a34a' : '#dc2626'};">৳ ${netProfit.toLocaleString()}</td></tr>
        </table>

        <div class="section-heading">4. Challenges & Solutions Identified</div>
        <p style="font-size: 11px; white-space: pre-line; background: #F8FAFC; padding: 8px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>Challenges:</strong><br/>${formData.challenges}</p>
        <p style="font-size: 11px; white-space: pre-line; background: #F8FAFC; padding: 8px; border-radius: 4px; border: 1px solid #E2E8F0; margin-top: 5px;"><strong>Solutions & Action Plan:</strong><br/>${formData.solutions}</p>

        <div class="section-heading">5. Next Month Targets & Strategy</div>
        <table>
          <tr><th>Target Metric</th><th style="text-align: right;">Target Value</th></tr>
          <tr><td>Target File Openings</td><td style="text-align: right; font-weight: bold; color: #2563EB;">${formData.nextMonthTargetFiles} Files</td></tr>
          <tr><td>Target Revenue</td><td style="text-align: right; font-weight: bold; color: #16a34a;">৳ ${formData.nextMonthTargetRevenue.toLocaleString()}</td></tr>
        </table>
        <p style="font-size: 11px; white-space: pre-line; background: #F8FAFC; padding: 8px; border-radius: 4px; border: 1px solid #E2E8F0;"><strong>Strategic Focus:</strong><br/>${formData.strategicFocus}</p>

        <div class="footer">
          Eduaimers Study Abroad Agency • Official Automated Monthly Strategic Report
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="page">
      <PageHeading eyebrow="STRATEGIC TEMPLATE" title="Monthly Business Report Generator" copy="Track digital marketing ROI, per-counselor KPI metrics (revenue, punctuality, grooming, quiz), challenges, and targets." />
      
      <div className="panel" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', border: '1px solid #dbeafe', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="eyebrow">AUTO COMPUTED PERFORMANCE</span>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>Monthly Status: <span style={{ color: performance.color }}>{performance.label}</span></h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Based on calculated net profit margins.</p>
          </div>
          <div style={{ display: 'flex', gap: '25px', background: '#fff', padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div><small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>TOTAL REVENUE</small><strong style={{ fontSize: '16px', color: '#2563eb' }}>৳ {totalRevenue.toLocaleString()}</strong></div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}><small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>NET PROFIT</small><strong style={{ fontSize: '16px', color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}>৳ {netProfit.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: '30px', marginBottom: '24px' }}>
        <div className="form-section-title"><span>01</span><div><h3>Report General Details</h3><p>Agency brand name and reporting duration.</p></div></div>
        <div className="form-grid three" style={{ marginBottom: '20px' }}>
          <Field label="Agency / Brand Name" value={formData.agencyName} onChange={(v) => setFormData({ ...formData, agencyName: v })} />
          <Field label="Month & Year" value={formData.monthYear} onChange={(v) => setFormData({ ...formData, monthYear: v })} />
          <Field label="Prepared By" value={formData.preparedBy} onChange={(v) => setFormData({ ...formData, preparedBy: v })} />
        </div>

        {/* Counselor KPI Management */}
        <div className="form-section-title"><span>02</span><div><h3>Per Counselor Performance & KPI Management</h3><p>Revenue, calls, visits, file openings, punctuality, corporate grooming, and quiz score.</p></div></div>
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <div className="form-grid three" style={{ marginBottom: '10px' }}>
            <Field label="Counselor Name" placeholder="e.g. Rahul Sen" value={newCName} onChange={(v) => setNewCName(v)} />
            <Field label="Total Calls" type="number" value={newCCalls} onChange={(v) => setNewCCalls(Number(v))} />
            <Field label="Total Visits" type="number" value={newCVisits} onChange={(v) => setNewCVisits(Number(v))} />
          </div>
          <div className="form-grid three" style={{ marginBottom: '10px' }}>
            <Field label="Converting Number" type="number" value={newCConv} onChange={(v) => setNewCConv(Number(v))} />
            <Field label="File Opening Count" type="number" value={newCFiles} onChange={(v) => setNewCFiles(Number(v))} />
            <Field label="Revenue Earned (BDT)" type="number" value={newCRev} onChange={(v) => setNewCRev(Number(v))} />
          </div>
          <div className="form-grid three" style={{ marginBottom: '15px' }}>
            <Field label="Punctuality (e.g. 95%)" value={newCPunctuality} onChange={(v) => setNewCPunctuality(v)} />
            <Field label="Corporate Grooming" value={newCGrooming} onChange={(v) => setNewCGrooming(v)} />
            <Field label="Quiz Score / Number" value={newCQuiz} onChange={(v) => setNewCQuiz(v)} />
          </div>
          <Button variant="secondary" icon="plus" onClick={handleAddCounselor}>Add Counselor Record & KPI</Button>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '25px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Counselor Name</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Calls/Visits</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Files/Conv</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Revenue</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Punctuality</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Grooming</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Quiz</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {counselors.map((c, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{c.totalCalls} / {c.totalVisits}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{c.fileOpening} / {c.convertingNumber}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#2563eb', fontWeight: 'bold' }}>৳ {c.revenueEarned.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{c.punctuality}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{c.grooming}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{c.quizScore}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => setCounselors(counselors.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Digital Marketing & Boosting Performance */}
        <div className="form-section-title"><span>03</span><div><h3>Digital Marketing & Boosting Performance</h3><p>Total boost cost, reach, responses, ROI, and status (Good, Bad, Not Good, Super/Excellent).</p></div></div>
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <div className="form-grid three" style={{ marginBottom: '10px' }}>
            <Field label="Campaign / Boost Name" placeholder="e.g. UK Lead Gen FB Ad" value={newCampName} onChange={(v) => setNewCampName(v)} />
            <Field label="Total Boost Cost (BDT)" type="number" value={newCampCost} onChange={(v) => setNewCampCost(Number(v))} />
            <Field label="Total Reach" type="number" value={newCampReach} onChange={(v) => setNewCampReach(Number(v))} />
          </div>
          <div className="form-grid three" style={{ marginBottom: '15px' }}>
            <Field label="Responses / Inquiries" type="number" value={newCampResp} onChange={(v) => setNewCampResp(Number(v))} />
            <Field label="ROI (e.g. 3.5x)" value={newCampRoi} onChange={(v) => setNewCampRoi(v)} />
            <label className="field"><span>Status</span>
              <select value={newCampStatus} onChange={(e) => setNewCampStatus(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', background: '#fff' }}>
                <option value="SUPER">SUPER / EXCELLENT</option>
                <option value="GOOD">GOOD</option>
                <option value="NOT GOOD">NOT GOOD</option>
                <option value="BAD">BAD</option>
              </select>
            </label>
          </div>
          <Button variant="secondary" icon="plus" onClick={handleAddCampaign}>Add Campaign Boost Record</Button>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '25px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Campaign Name</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Cost (BDT)</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Reach</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Responses</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>ROI</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{camp.campaignName}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>৳ {camp.totalBoostCost.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{camp.totalReach.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{camp.responses}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>{camp.roi}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: getStatusBadgeColor(camp.status), color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                      {camp.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => setCampaigns(campaigns.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-section-title"><span>04</span><div><h3>Financial Overview Inputs (BDT)</h3><p>Revenue and operational expenditures.</p></div></div>
        <div className="form-grid three" style={{ marginBottom: '20px' }}>
          <Field label="Revenue from File Fees" type="number" value={formData.fileFeeRevenue} onChange={(v) => setFormData({ ...formData, fileFeeRevenue: Number(v) })} />
          <Field label="University Commission" type="number" value={formData.uniCommission} onChange={(v) => setFormData({ ...formData, uniCommission: Number(v) })} />
          <Field label="Sub-Agent Payouts" type="number" value={formData.subAgentPayouts} onChange={(v) => setFormData({ ...formData, subAgentPayouts: Number(v) })} />
          <Field label="Refunds / Penalties" type="number" value={formData.refunds} onChange={(v) => setFormData({ ...formData, refunds: Number(v) })} />
          <Field label="Marketing & Ops Cost" type="number" value={formData.marketingCosts} onChange={(v) => setFormData({ ...formData, marketingCosts: Number(v) })} />
        </div>

        <div className="form-section-title"><span>05</span><div><h3>Challenges & Solutions</h3><p>Identify operational problems and proposed action plans.</p></div></div>
        <div className="form-grid two" style={{ marginBottom: '20px' }}>
          <label className="field"><span>Problems & Challenges Identified</span><textarea rows={3} value={formData.challenges} onChange={(e) => setFormData({ ...formData, challenges: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></label>
          <label className="field"><span>Solutions & Action Plan</span><textarea rows={3} value={formData.solutions} onChange={(e) => setFormData({ ...formData, solutions: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></label>
        </div>

        <div className="form-section-title"><span>06</span><div><h3>Next Month Targets & Strategy</h3><p>Set upcoming file opening targets, revenue goals, and strategic focus.</p></div></div>
        <div className="form-grid two" style={{ marginBottom: '20px' }}>
          <Field label="Target File Openings" type="number" value={formData.nextMonthTargetFiles} onChange={(v) => setFormData({ ...formData, nextMonthTargetFiles: Number(v) })} />
          <Field label="Target Revenue (BDT)" type="number" value={formData.nextMonthTargetRevenue} onChange={(v) => setFormData({ ...formData, nextMonthTargetRevenue: Number(v) })} />
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label className="field"><span>Strategic Focus / Priorities</span><textarea rows={2} value={formData.strategicFocus} onChange={(e) => setFormData({ ...formData, strategicFocus: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></label>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <Button variant="primary" icon="download" onClick={handleGenerateMonthlyReportPDF}>
            Generate & Download Monthly Report PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

function Analytics() {
  return <div className="page">
    <PageHeading eyebrow="PERFORMANCE CENTER" title="Monthly KPI & Analytics" copy="Track activity, conversion, knowledge, and learning performance."><select className="period-select"><option>October 2026</option></select></PageHeading>
    <div className="kpi-summary">
      <div><span>OVERALL KPI SCORE</span><strong>0<small>%</small></strong><p>Pending assessment</p></div>
    </div>
  </div>
}
function CounselorDetailModal({ counselor, onClose }: { counselor: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'reports' | 'quizzes' | string>('reports')
  const [customTabs, setCustomTabs] = useState<string[]>(['performance_notes'])
  const [newTabName, setNewTabName] = useState('')
  const handleAddTab = () => {
    if (!newTabName.trim()) return
    setCustomTabs([...customTabs, newTabName.trim().toLowerCase().replace(/\s+/g, '_')])
    setNewTabName('')
  }
  const historyList = counselor.reportsHistory || []
  return <div className="modal-layer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <button className="modal-scrim" onClick={onClose} />
    <div className="panel" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', zIndex: 100, background: '#fff', padding: '30px', borderRadius: '16px' }}>
      <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{counselor.name}</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>{counselor.email} | Counselor Profile & KPI</p>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
      </div>
      
      {/* Counselor KPI Summary Panel on Profile */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div><small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>REVENUE GENERATED</small><strong style={{ color: '#2563eb', fontSize: '16px' }}>৳ {(counselor.revenueEarned || 120000).toLocaleString()}</strong></div>
        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}><small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>PUNCTUALITY</small><strong style={{ color: '#16a34a', fontSize: '16px' }}>{counselor.punctuality || '95%'}</strong></div>
        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}><small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>CORP. GROOMING</small><strong style={{ color: '#0f172a', fontSize: '16px' }}>{counselor.grooming || 'Excellent'}</strong></div>
        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}><small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>QUIZ SCORE</small><strong style={{ color: '#9333ea', fontSize: '16px' }}>{counselor.score || '85%'}</strong></div>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', paddingBottom: '10px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('reports')} 
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'reports' ? '#2563eb' : '#f1f5f9', color: activeTab === 'reports' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Weekly Reports History ({historyList.length})
        </button>
        <button 
          onClick={() => setActiveTab('quizzes')} 
          style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'quizzes' ? '#2563eb' : '#f1f5f9', color: activeTab === 'quizzes' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Quiz Attempts History
        </button>
        
        {customTabs.map(tabKey => (
          <button 
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === tabKey ? '#2563eb' : '#f1f5f9', color: activeTab === tabKey ? '#fff' : '#475569', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer' }}
          >
            {tabKey.replace(/_/g, ' ')}
          </button>
        ))}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="New tab..." 
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          />
          <button onClick={handleAddTab} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>+ Add Tab</button>
        </div>
      </div>
      {activeTab === 'reports' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>All Submitted Weekly Reports</h3>
          {historyList.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>No weekly reports submitted yet by this counselor.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Week Ending</th>
                  <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>File Name</th>
                  <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Submitted Date</th>
                  <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((rep: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
  <button 
    onClick={() => {
      const printWin = window.open('', '_blank');
      if (printWin) {
        const rawDoc = decodeURIComponent((rep.pdfUrl || '').replace('data:text/html;charset=utf-8,', ''));
        printWin.document.write(rawDoc);
        printWin.document.close();
      }
    }} 
    style={{ color: '#2563eb', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}
  >
    View Report →
  </button>

  <a 
    href={rep.pdfUrl} 
    download={rep.fileName || 'Weekly-Report.html'}
    style={{ 
      background: '#2563eb', 
      color: '#fff', 
      padding: '5px 10px', 
      borderRadius: '6px', 
      fontSize: '12px', 
      fontWeight: 'bold', 
      textDecoration: 'none', 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '4px' 
    }}
  >
    ⬇ Download Report
  </a>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === 'quizzes' && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Quiz Attempt Status</h3>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '15px' }}><strong>Latest Quiz Score:</strong> {counselor.score || 'Not Attempted'}</p>
          </div>
        </div>
      )}
      {!['reports', 'quizzes'].includes(activeTab) && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '8px' }}>{activeTab.replace(/_/g, ' ')}</h3>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Custom section data and counselor notes can be managed here.</p>
        </div>
      )}
    </div>
  </div>
}
function Admin({ 
  materials, tickerText, setTickerText, activeQuiz, teamScores, setTeamScores, onGrantAccess, 
  reportSettings, setReportSettings, onUpdateReportStatus, kbDocuments 
}: any) {
  const [tab, setTab] = useState<'announcement' | 'resources' | 'knowledge_admin' | 'quiz' | 'reports_admin' | 'team'>('announcement')
  const [published, setPublished] = useState('')
  
  const [announcementText, setAnnouncementText] = useState(tickerText)
  
  const [quizTitle, setQuizTitle] = useState(activeQuiz?.title || "Spain & UK Visa Updates")
  const [quizStartDate, setQuizStartDate] = useState(activeQuiz?.startDate || "2026-10-31")
  const [quizStartTime, setQuizStartTime] = useState(activeQuiz?.startTime || "15:00")
  const [quizTimer, setQuizTimer] = useState(activeQuiz?.timer || "20")
  useEffect(() => {
    if (activeQuiz) {
      if (activeQuiz.title) setQuizTitle(activeQuiz.title)
      if (activeQuiz.startDate) setQuizStartDate(activeQuiz.startDate)
      if (activeQuiz.startTime) setQuizStartTime(activeQuiz.startTime)
      if (activeQuiz.timer) setQuizTimer(activeQuiz.timer)
    }
  }, [activeQuiz])
  
  const [questionsList, setQuestionsList] = useState<any[]>(
    activeQuiz?.questions || [
      { text: 'What is the updated minimum maintenance period?', type: 'mcq', options: ['28 consecutive days', '30 calendar days', '21 working days', '90 consecutive days'], answerKey: '28 consecutive days', points: 2 },
      { text: 'Which documents support Spain IPREM proof?', type: 'checkbox', options: ['Personal bank statement', 'Property valuation only', 'Confirmed scholarship letter', 'Sponsor affidavit'], answerKey: ['Personal bank statement', 'Confirmed scholarship letter', 'Sponsor affidavit'], points: 3 }
    ]
  )
  const [newCounselorName, setNewCounselorName] = useState('')
  const [newCounselorEmail, setNewCounselorEmail] = useState('')
  const [newCounselorPass, setNewCounselorPass] = useState('')
  const [selectedKbCategory, setSelectedKbCategory] = useState<'moi' | 'spouse' | 'visa' | 'flowchart' | 'training'>('moi')
  const [kbTitle, setKbTitle] = useState('')
  const [kbPdfUrl, setKbPdfUrl] = useState('')
  const [kbPdfFile, setKbPdfFile] = useState<File | null>(null)
  const [kbUploading, setKbUploading] = useState(false)
  const [editingKbId, setEditingKbId] = useState<string | null>(null)
  const [countryName, setCountryName] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [manualPdfUrl, setManualPdfUrl] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
  const CLOUD_NAME = "ddziennkh"
  const UPLOAD_PRESET = "eduaimers_pdf_preset"
  const handleOnboardCounselor = async (e: FormEvent) => {
    e.preventDefault()
    if (!newCounselorName.trim() || !newCounselorEmail.trim() || !newCounselorPass.trim()) {
      alert("Please fill Name, Email, and Password!")
      return
    }
    const cleanMail = newCounselorEmail.trim().toLowerCase()
    try {
      await setDoc(doc(db, "counselors", cleanMail), {
        name: newCounselorName.trim(),
        email: cleanMail,
        password: newCounselorPass.trim(),
        reportsHistory: [],
        createdAt: new Date()
      })
      const initials = newCounselorName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      setTeamScores((prev: any[]) => [...prev, { name: newCounselorName, email: cleanMail, avatar: initials, score: 'Not Attempted', reportStatus: 'Pending', reportsHistory: [] }])
      setPublished(`Counselor ${newCounselorName} onboarded successfully!`)
      setNewCounselorName('')
      setNewCounselorEmail('')
      setNewCounselorPass('')
    } catch (err) {
      alert("Failed to onboard counselor.")
    }
  }
  const handleSaveKbPdf = async (e: FormEvent) => {
    e.preventDefault()
    if (!kbTitle.trim()) {
      alert("Please enter PDF Document Title!")
      return
    }
    setKbUploading(true)
    try {
      let finalUrl = kbPdfUrl
      if (kbPdfFile) {
        const formData = new FormData()
        formData.append("file", kbPdfFile)
        formData.append("upload_preset", UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.secure_url) {
          finalUrl = data.secure_url
        }
      }
      if (!finalUrl) {
        alert("Please select a PDF file from PC or enter Cloudinary URL!")
        setKbUploading(false)
        return
      }
      const payload = {
        categoryId: selectedKbCategory,
        title: kbTitle.trim(),
        pdfUrl: finalUrl,
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
      if (editingKbId) {
        await updateDoc(doc(db, "knowledgeBasePdfs", editingKbId), payload)
        setEditingKbId(null)
        setPublished("Knowledge Base PDF updated successfully!")
      } else {
        await addDoc(collection(db, "knowledgeBasePdfs"), payload)
        setPublished("Knowledge Base PDF uploaded successfully!")
      }
      setKbTitle('')
      setKbPdfUrl('')
      setKbPdfFile(null)
    } catch (err) {
      alert("Failed to save Knowledge Base PDF.")
    } finally {
      setKbUploading(false)
    }
  }
  const handleEditKbItem = (item: any) => {
    setEditingKbId(item.id)
    setKbTitle(item.title)
    setKbPdfUrl(item.pdfUrl)
    setSelectedKbCategory(item.categoryId)
  }
  const handleDeleteKbItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this PDF?")) {
      try {
        await deleteDoc(doc(db, "knowledgeBasePdfs", id))
        setPublished("PDF deleted successfully!")
      } catch (err) {
        alert("Failed to delete PDF.")
      }
    }
  }
  const [reportDeadline, setReportDeadline] = useState(reportSettings?.deadline || '2026-10-27')
  const [reportDeadlineTime, setReportDeadlineTime] = useState(reportSettings?.deadlineTime || '18:00')
  const handlePublishAnnouncement = async () => {
    try {
      await setDoc(doc(db, "announcements", "live"), { text: announcementText, updatedAt: new Date() })
      setTickerText(announcementText)
      setPublished('Announcement updated and published live successfully!')
    } catch (e) {
      alert("Failed to update announcement.")
    }
  }
  const handlePublishQuiz = async () => {
    try {
      const formattedQuestions = questionsList.map((q: any) => {
        const type = q.type || 'mcq'
        let optionsArr = q.options
        if (typeof optionsArr === 'string') {
          optionsArr = (optionsArr as string).split(',').map((s: string) => s.trim())
        }
        if (!optionsArr || !Array.isArray(optionsArr) || optionsArr.length === 0) {
          optionsArr = ['Option A', 'Option B', 'Option C', 'Option D']
        }
        return {
          text: q.text || 'Untitled Question',
          type,
          options: optionsArr,
          answerKey: q.answerKey || optionsArr[0],
          points: Number(q.points || 2)
        }
      })
      const quizDataToSave = {
        title: quizTitle,
        startDate: quizStartDate,
        startTime: quizStartTime,
        timer: quizTimer,
        questions: formattedQuestions,
        updatedAt: new Date()
      }
      await setDoc(doc(db, "quizzes", "active"), quizDataToSave)
      setPublished('Quiz schedule and settings updated live successfully!')
    } catch (e: any) {
      alert("Failed to publish quiz: " + e.message)
    }
  }
  const handleSaveReportSettings = async (overrideParams?: any) => {
    const newSettings = {
      deadline: reportDeadline,
      deadlineTime: reportDeadlineTime,
      isOpen: overrideParams?.isOpen !== undefined ? overrideParams.isOpen : reportSettings?.isOpen || false,
      isClosed: overrideParams?.isClosed !== undefined ? overrideParams.isClosed : reportSettings?.isClosed || false
    }
    setReportSettings(newSettings)
    try {
      await setDoc(doc(db, "settings", "reports"), newSettings)
      setPublished('Weekly report settings updated successfully!')
    } catch (e) {
      alert("Failed to save report settings.")
    }
  }
  const handlePdfUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!countryName || !docTitle) {
      alert("Please fill country name and document title!")
      return
    }
    setUploading(true)
    try {
      let finalFileUrl = manualPdfUrl
      if (pdfFile) {
        const formData = new FormData()
        formData.append("file", pdfFile)
        formData.append("upload_preset", UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.secure_url) {
          finalFileUrl = data.secure_url
        }
      }
      if (!finalFileUrl) {
        alert("Please browse a PDF file or enter a Cloudinary PDF link!")
        setUploading(false)
        return
      }
      const payload = {
        country: countryName.trim().toLowerCase(),
        displayCountry: countryName.trim(),
        title: docTitle.trim(),
        fileUrl: finalFileUrl,
        createdAt: new Date(),
      }
      if (editingMaterialId) {
        await updateDoc(doc(db, "trainingDocuments", editingMaterialId), payload)
        setPublished("Training material updated/replaced successfully!")
        setEditingMaterialId(null)
      } else {
        await addDoc(collection(db, "trainingDocuments"), payload)
        setPublished("Training material published successfully!")
      }
      setCountryName('')
      setDocTitle('')
      setManualPdfUrl('')
      setPdfFile(null)
    } catch (error) {
      alert("Failed to publish/update training resource.")
    } finally {
      setUploading(false)
    }
  }
  const handleEditTrainingMaterial = (item: any) => {
    setEditingMaterialId(item.id)
    setCountryName(item.displayCountry || item.country || '')
    setDocTitle(item.title || '')
    setManualPdfUrl(item.fileUrl || '')
  }
  const handleDeleteTrainingMaterial = async (id: string) => {
    if (confirm("Are you sure you want to delete this training material?")) {
      try {
        await deleteDoc(doc(db, "trainingDocuments", id))
        setPublished("Training material deleted successfully!")
      } catch (e) {
        alert("Failed to delete training material.")
      }
    }
  }
  return <div className="page">
    <PageHeading eyebrow="MANAGEMENT" title="Admin Control Panel" copy="Manage live content, team assessments, and reporting."><span className="admin-role"><Icon name="lock" size={15} /> ADMIN ROLE ONLY</span></PageHeading>
    
    <div className="admin-tabs">
      {[
        ['announcement', 'Live ticker', 'edit'], 
        ['resources', 'PDF resources', 'upload'], 
        ['knowledge_admin', 'Knowledge Base PDFs', 'file'],
        ['quiz', 'Quiz builder', 'quiz'], 
        ['reports_admin', 'Report Window', 'clock'], 
        ['team', 'Team monitoring', 'chart']
      ].map(([id, label, icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id as typeof tab)}><Icon name={icon as IconName} />{label}</button>)}
    </div>
    {published && <div className="toast"><Icon name="check" /> {published}<button onClick={() => setPublished('')}><Icon name="close" size={15} /></button></div>}
    
    {tab === 'announcement' && <div className="admin-grid">
      <section className="panel admin-main">
        <div className="form-section-title"><span><Icon name="edit" /></span><div><h3>Announcement ticker editor</h3><p>Changes appear instantly across every counselor workspace.</p></div></div>
        <label className="field"><span>Live announcement text</span>
          <textarea value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} rows={3} />
        </label>
        <div className="form-grid two"><Field label="Status" value="Live Active" /><Field label="Display until" type="date" defaultValue="2026-10-31" /></div>
        <footer><Button onClick={handlePublishAnnouncement}>Publish announcement live</Button></footer>
      </section>
      <aside className="panel admin-side"><span className="eyebrow">PUBLISHING TIPS</span><h3>Keep it useful</h3><ul><li><Icon name="check" /> Lead with urgent updates.</li></ul></aside>
    </div>}
    {tab === 'resources' && <div className="admin-grid">
      <form onSubmit={handlePdfUpload} className="panel admin-main">
        <div className="form-section-title">
          <span><Icon name="upload" /></span>
          <div>
            <h3>{editingMaterialId ? 'Edit / Replace PDF Resource' : 'Publish a PDF Resource'}</h3>
            <p>Add or update country-specific guides in the training library.</p>
          </div>
        </div>
        <div className="form-grid two">
          <Field label="Country name" placeholder="Type country name (e.g. Spain)" value={countryName} onChange={(val) => setCountryName(val)} />
          <Field label="Document title" placeholder="e.g. Visa requirements 2026" value={docTitle} onChange={(val) => setDocTitle(val)} />
        </div>
        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
          <Field label="Cloudinary PDF URL (Direct Link)" placeholder="https://res.cloudinary.com/..." value={manualPdfUrl} onChange={(v) => setManualPdfUrl(v)} />
        </div>
        <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', marginBottom: '16px' }}>
          <span style={{ display: 'block', marginBottom: '8px' }}><Icon name="upload" size={24} /></span>
          <label style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline', display: 'inline-block' }}>
            Or Browse PDF File from PC
            <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]) }} />
          </label>
          <p style={{ marginTop: '8px', color: '#64748b', fontSize: '13px' }}>{pdfFile ? `Selected: ${pdfFile.name}` : "PDF file upload"}</p>
        </div>
        <footer style={{ display: 'flex', gap: '10px' }}>
          <Button type="submit" disabled={uploading}>{uploading ? "Saving..." : editingMaterialId ? "Update Training Material" : "Publish Resource"}</Button>
          {editingMaterialId && (
            <Button variant="secondary" onClick={() => { setEditingMaterialId(null); setCountryName(''); setDocTitle(''); setManualPdfUrl(''); setPdfFile(null); }}>
              Cancel Edit
            </Button>
          )}
        </footer>
      </form>
      <aside className="panel recent-uploads">
        <span className="eyebrow">UPLOADED TRAINING MATERIALS</span>
        <h3>Manage Materials ({materials.length})</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {materials.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>No training materials uploaded yet.</p>
          ) : (
            materials.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>{item.title}</strong>
                  <small style={{ color: '#64748b' }}>{item.displayCountry || item.country}</small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditTrainingMaterial(item)} style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteTrainingMaterial(item.id)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>}
    {tab === 'knowledge_admin' && <div className="panel" style={{ padding: '30px' }}>
      <div className="form-section-title" style={{ marginBottom: '20px' }}>
        <span><Icon name="file" /></span>
        <div>
          <h3>Quick Knowledge Base PDF Management</h3>
          <p>Add/edit multiple PDFs under the 4 main knowledge categories via direct PC upload or Cloudinary URL.</p>
        </div>
      </div>
      <form onSubmit={handleSaveKbPdf} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <div className="form-grid two" style={{ marginBottom: '15px' }}>
          <label className="field">
            <span>Select Category</span>
            <select value={selectedKbCategory} onChange={(e) => setSelectedKbCategory(e.target.value as any)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', background: '#fff' }}>
              <option value="moi">[01] MOI Accepted Country & University List</option>
              <option value="spouse">[02] Spouse Allowed Flight Countries</option>
              <option value="visa">[03] Visa Checklist</option>
              <option value="flowchart">[04] Application-to-Visa Step Flowchart</option>
              <option value="training">Training Materials</option>
            </select>
          </label>
          <Field label="PDF Document Title" placeholder="e.g. UK MOI Universities 2026" value={kbTitle} onChange={(v) => setKbTitle(v)} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <Field label="Cloudinary PDF URL (Optional if uploading file)" placeholder="https://res.cloudinary.com/..." value={kbPdfUrl} onChange={(v) => setKbPdfUrl(v)} />
        </div>
        <div style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#fff', marginBottom: '15px' }}>
          <label style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline', display: 'inline-block' }}>
            Browse PDF File from PC for Knowledge Base
            <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) setKbPdfFile(e.target.files[0]) }} />
          </label>
          <p style={{ marginTop: '6px', color: '#64748b', fontSize: '13px' }}>{kbPdfFile ? `Selected: ${kbPdfFile.name}` : "No file chosen"}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="submit" disabled={kbUploading}>{kbUploading ? "Uploading..." : editingKbId ? 'Update / Replace PDF' : 'Upload & Add PDF'}</Button>
          {editingKbId && <Button variant="secondary" onClick={() => { setEditingKbId(null); setKbTitle(''); setKbPdfUrl(''); setKbPdfFile(null); }}>Cancel Edit</Button>}
        </div>
      </form>
      <div>
        {[...KNOWLEDGE_CATEGORIES, { id: 'training', badgeNumber: '05', title: 'Training Materials', description: '' }].map((cat) => {
          const catItems = kbDocuments.filter((d: any) => d.categoryId === cat.id)
          return (
            <div key={cat.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
                [{cat.badgeNumber}] {cat.title} ({catItems.length} PDFs)
              </h4>
              {catItems.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>No PDFs uploaded in this category yet.</p>
              ) : (
                <div>
                  {catItems.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', marginBottom: '6px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#334155' }}>{item.title}</strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '10px' }}>Updated: {item.updatedAt}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <a href={item.pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>View PDF</a>
                        <button onClick={() => handleEditKbItem(item)} style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Edit / Replace</button>
                        <button onClick={() => handleDeleteKbItem(item.id)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>}
    {tab === 'reports_admin' && <div className="admin-grid">
      <section className="panel admin-main">
        <div className="form-section-title"><span><Icon name="clock" /></span><div><h3>Weekly Report Submission Window & Access Override</h3><p>Set deadline time or manually override access to open/lock the portal anytime.</p></div></div>
        <div className="form-grid two" style={{ marginBottom: '20px' }}>
          <Field label="Deadline Date" type="date" value={reportDeadline} onChange={(val) => setReportDeadline(val)} />
          <Field label="Deadline Time (24h)" type="time" value={reportDeadlineTime} onChange={(val) => setReportDeadlineTime(val)} />
        </div>
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
          <h4 style={{ marginBottom: '10px' }}>Manual Portal Controls (On-Demand Override)</h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="gold" onClick={() => {
              handleSaveReportSettings({ isOpen: true, isClosed: false })
              alert("Report portal force-opened! Counselors can submit now regardless of deadline.")
            }}>Force Open Portal (Re-open)</Button>
            <Button variant="danger" onClick={() => {
              handleSaveReportSettings({ isOpen: false, isClosed: true })
              alert("Report portal force-locked!")
            }}>Lock / Close Portal Now</Button>
            <Button variant="secondary" onClick={() => {
              handleSaveReportSettings({ isOpen: false, isClosed: false })
              alert("Reset to Automatic Scheduled Deadline Mode.")
            }}>Reset to Schedule Timer</Button>
          </div>
        </div>
        <footer style={{ marginTop: '20px' }}><Button onClick={() => handleSaveReportSettings()}>Save Deadline Settings</Button></footer>
      </section>
      <aside className="panel admin-side">
        <span className="eyebrow">PORTAL STATUS</span>
        <h3>Current Portal State</h3>
        <div style={{ marginTop: '10px', fontSize: '15px' }}>
          {reportSettings?.isOpen ? (
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>● MANUAL FORCE OPEN ACTIVE</span>
          ) : reportSettings?.isClosed ? (
            <span style={{ color: '#dc2626', fontWeight: 'bold' }}>● MANUAL LOCKED</span>
          ) : (
            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>● AUTOMATIC TIMER ACTIVE</span>
          )}
        </div>
      </aside>
    </div>}
    {tab === 'quiz' && <div className="quiz-builder">
      <section className="panel"><div className="form-section-title"><span><Icon name="calendar" /></span><div><h3>Quiz Configuration & Schedule</h3><p>Set custom date, start time, and timer limit.</p></div></div>
        <div className="form-grid three">
          <Field label="Quiz Title" value={quizTitle} onChange={(val) => setQuizTitle(val)} />
          <Field label="Start date" type="date" value={quizStartDate} onChange={(val) => setQuizStartDate(val)} />
          <Field label="Start time (24h)" type="time" value={quizStartTime} onChange={(val) => setQuizStartTime(val)} />
        </div>
        <div className="form-grid two" style={{ marginTop: '16px' }}>
          <Field label="Timer limit (minutes)" type="number" value={quizTimer} onChange={(val) => setQuizTimer(val)} />
        </div>
      </section>
      <section className="panel builder-main">
        <div className="panel-head"><div><span className="eyebrow">QUESTION BUILDER</span><h3>{quizTitle}</h3></div><span>{questionsList.length} QUESTIONS</span></div>
        {questionsList.map((q: any, i: number) => (
          <div className="builder-question" key={i} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
            <span className="drag">⠿</span>
            <div style={{ flex: 1 }}>
              <div className="form-grid two" style={{ marginBottom: '10px' }}>
                <label className="field"><span>Question Type</span>
                  <select value={q.type || 'mcq'} onChange={(e) => {
                    const updated = [...questionsList]
                    updated[i].type = e.target.value
                    setQuestionsList(updated)
                  }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}>
                    <option value="mcq">MCQ (Single Choice)</option>
                    <option value="checkbox">Checkbox (Multiple Select)</option>
                    <option value="short">Short Answer</option>
                  </select>
                </label>
                <Field label="Points" type="number" value={q.points || 2} onChange={(val) => {
                  const updated = [...questionsList]
                  updated[i].points = Number(val)
                  setQuestionsList(updated)
                }} />
              </div>
              <label className="field" style={{ marginBottom: '10px' }}><span>Question Text {i + 1}</span>
                <input value={q.text || ''} placeholder="Enter your question" onChange={(e) => {
                  const updated = [...questionsList]
                  updated[i].text = e.target.value
                  setQuestionsList(updated)
                }} />
              </label>
              {q.type !== 'short' && (
                <div style={{ marginBottom: '10px' }}>
                  <label className="field"><span>Options (comma separated 4 options)</span>
                    <input value={Array.isArray(q.options) ? q.options.join(', ') : (q.options || '')} placeholder="Option A, Option B, Option C, Option D" onChange={(e) => {
                      const updated = [...questionsList]
                      updated[i].options = e.target.value.split(',').map(s => s.trim())
                      setQuestionsList(updated)
                    }} />
                  </label>
                </div>
              )}
              <div>
                <label className="field"><span>Correct Answer Key {q.type === 'checkbox' ? '(comma separated exact options)' : ''}</span>
                  <input value={Array.isArray(q.answerKey) ? q.answerKey.join(', ') : (q.answerKey || '')} placeholder={q.type === 'checkbox' ? "Option A, Option C" : "Exact correct option or text"} onChange={(e) => {
                    const updated = [...questionsList]
                    if (q.type === 'checkbox') {
                      updated[i].answerKey = e.target.value.split(',').map(s => s.trim())
                    } else {
                      updated[i].answerKey = e.target.value
                    }
                    setQuestionsList(updated)
                  }} />
                </label>
              </div>
            </div>
            <button className="delete-question" onClick={() => setQuestionsList(questionsList.filter((_, idx) => idx !== i))}>×</button>
          </div>
        ))}
        <Button variant="secondary" icon="plus" onClick={() => setQuestionsList([...questionsList, { text: '', type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], answerKey: 'Option A', points: 2 }])}>Add question</Button>
        <footer><Button onClick={handlePublishQuiz}>Schedule & publish quiz live</Button></footer>
      </section>
    </div>}
    
    {tab === 'team' && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <form onSubmit={handleOnboardCounselor} className="panel" style={{ padding: '20px' }}>
        <div className="form-section-title"><span><Icon name="plus" /></span><div><h3>Onboard New Counselor</h3><p>Create Name, Email, and Password to issue credentials to counselors.</p></div></div>
        <div className="form-grid three" style={{ marginBottom: '15px' }}>
          <Field label="Counselor Full Name" placeholder="e.g. Rahul Sen" value={newCounselorName} onChange={(val) => setNewCounselorName(val)} />
          <Field label="Counselor Email ID" placeholder="rahul@eduaimers.com" value={newCounselorEmail} onChange={(val) => setNewCounselorEmail(val)} />
          <Field label="Assign Password" placeholder="e.g. rahul2026" value={newCounselorPass} onChange={(val) => setNewCounselorPass(val)} />
        </div>
        <Button type="submit">Onboard & Issue Credentials</Button>
      </form>
      <div className="panel team-table">
        <div className="panel-head">
          <div><span className="eyebrow">TEAM PERFORMANCE</span><h3>Counselor Monitoring & Reports</h3></div>
          <Button variant="secondary" icon="download">Export CSV</Button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Counselor (Click for Details)</th>
                <th>Report Status</th>
                <th>Quiz Score</th>
                <th>Report Review Action</th>
                <th>Quiz Access Control</th>
              </tr>
            </thead>
            <tbody>
              {teamScores.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No counselors onboarded yet.</td></tr>
              ) : (
                teamScores.map((r: any) => (
                  <tr key={r.email || r.name}>
                    <td>
                      <button 
                        onClick={() => r.onSelectCounselor?.(r)} 
                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span className="avatar">{r.avatar}</span>
                        <div>
                          <strong style={{ color: '#2563eb', textDecoration: 'underline' }}>{r.name}</strong>
                          <small style={{ display: 'block', color: '#64748b' }}>{r.email}</small>
                        </div>
                      </button>
                    </td>
                    <td>
                      <span className="status" style={{ color: r.reportStatus === 'Approved' ? '#16a34a' : r.reportStatus === 'Rejected' ? '#dc2626' : '#d97706', fontWeight: 'bold' }}>
                        {r.reportStatus || 'Pending Review'}
                      </span>
                    </td>
                    <td><b>{r.score || 'Not Attempted'}</b></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" onClick={() => {
                          onUpdateReportStatus(r.name, 'Approved')
                          alert(`Report approved for ${r.name}!`)
                        }}>Approve</Button>
                        <Button variant="danger" onClick={() => {
                          onUpdateReportStatus(r.name, 'Rejected')
                          alert(`Report rejected for ${r.name}.`)
                        }}>Reject</Button>
                      </div>
                    </td>
                    <td>
                      <Button variant="secondary" onClick={() => {
                        onGrantAccess(r.email || r.name)
                        alert(`Quiz re-attempt access granted for ${r.name}!`)
                      }}>Grant Quiz Attempt</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>}
  </div>
}
function PdfModal({ title, fileUrl, onClose }: { title: string; fileUrl?: string; onClose: () => void }) {
  return <div className="modal-layer pdf-layer">
    <button className="modal-scrim" onClick={onClose} aria-label="Close PDF" />
    <div className="pdf-modal">
      <header>
        <div><span className="pdf-mark"><Icon name="file" /></span><div><small>TRAINING DOCUMENT · PDF</small><h2>{title}</h2></div></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {fileUrl && fileUrl !== '#' && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 }}>Download / Open PDF</a>}
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
      </header>
      <div className="pdf-view" style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', height: '100%', overflowY: 'auto' }}>
        {fileUrl && fileUrl !== '#' ? (
          <iframe src={fileUrl} title={title} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }} />
        ) : (
          <div style={{ padding: '40px' }}>
            <h3>Preview not available</h3>
            <p>This is a sample document.</p>
          </div>
        )}
      </div>
    </div>
  </div>
}
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<'counselor' | 'admin'>('counselor')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [page, setPage] = useState<Page>('dashboard')
  const [pdfData, setPdfData] = useState<{ title: string; url?: string } | null>(null)
  const [menu, setMenu] = useState(false)
  
  const [materials, setMaterials] = useState<any[]>([])
  const [kbDocuments, setKbDocuments] = useState<any[]>([])
  const [tickerText, setTickerText] = useState("Global Application Day scheduled for Oct 31, 2026 • New Spain IPREM proof rules updated")
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [reportSettings, setReportSettings] = useState<any>({ deadline: '2026-10-27', deadlineTime: '18:00', isOpen: false, isClosed: false })
  const [teamScores, setTeamScores] = useState<any[]>([])
  const [selectedCounselorModal, setSelectedCounselorModal] = useState<any>(null)
  const handleScoreSubmit = (scoreStr: string) => {
    setTeamScores(prev => prev.map(c => ((c.email || '').toLowerCase() === (userEmail || '').toLowerCase() || c.name === userName) ? { ...c, score: scoreStr } : c))
  }
  const handleReportSubmit = (_reportData: any, _pdfUrl: string, _fileName: string) => {
    setTeamScores(prev => prev.map(c => ((c.email || '').toLowerCase() === (userEmail || '').toLowerCase() || c.name === userName) ? { ...c, reportStatus: 'Submitted (Pending Review)' } : c))
  }
  const handleUpdateReportStatus = (counselorName: string, status: string) => {
    setTeamScores(prev => prev.map(c => c.name === counselorName ? { ...c, reportStatus: status } : c))
  }
  const handleGrantAccess = async (identifier: string) => {
    try {
      await setDoc(doc(db, "quiz_attempts", (identifier || '').toLowerCase()), {
        submitted: false,
        scoreStr: 'Pending',
        scoreData: null
      })
    } catch (e) {
      console.error("Failed to reset quiz access:", e)
    }
  }
  useEffect(() => {
    const unsubTraining = onSnapshot(collection(db, "trainingDocuments"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMaterials(docs)
    })
    const unsubKb = onSnapshot(collection(db, "knowledgeBasePdfs"), (snapshot) => {
      const kbList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setKbDocuments(kbList)
    })
    const unsubCounselors = onSnapshot(collection(db, "counselors"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      if (docs.length > 0) {
        setTeamScores(docs.map((c: any) => ({
          name: c.name,
          email: c.email,
          avatar: (c.name || 'CU').slice(0, 2).toUpperCase(),
          score: c.score || 'Not Attempted',
          reportStatus: 'Pending Review',
          reportsHistory: c.reportsHistory || [],
          revenueEarned: c.revenueEarned || 120000,
          punctuality: c.punctuality || '95%',
          grooming: c.grooming || 'Excellent',
          onSelectCounselor: (counselorObj: any) => setSelectedCounselorModal(counselorObj)
        })))
      }
    })
    const unsubAnnouncement = onSnapshot(doc(db, "announcements", "live"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().text) {
        setTickerText(docSnap.data().text)
      }
    })
    const unsubQuiz = onSnapshot(doc(db, "quizzes", "active"), (docSnap) => {
      if (docSnap.exists()) {
        setActiveQuiz(docSnap.data())
      }
    })
    const unsubReportSettings = onSnapshot(doc(db, "settings", "reports"), (docSnap) => {
      if (docSnap.exists()) {
        setReportSettings(docSnap.data())
      }
    })
    return () => {
      unsubTraining()
      unsubKb()
      unsubCounselors()
      unsubAnnouncement()
      unsubQuiz()
      unsubReportSettings()
    }
  }, [])
  const content = useMemo(() => {
    if (page === 'dashboard') return <Dashboard setPage={setPage} openPdf={(t, u) => setPdfData({ title: t, url: u })} materials={materials} userName={userName} activeQuiz={activeQuiz} reportSettings={reportSettings} />
    if (page === 'training') return <Training openPdf={(t, u) => setPdfData({ title: t, url: u })} materials={materials} />
    if (page === 'knowledge') return <Knowledge kbDocuments={kbDocuments} />
    if (page === 'quiz') return <Quiz activeQuiz={activeQuiz} counselorEmail={userEmail} userName={userName} onScoreSubmit={handleScoreSubmit} />
    if (page === 'reports') return <Reports reportSettings={reportSettings} onReportSubmit={handleReportSubmit} userName={userName} counselorEmail={userEmail} />
    if (page === 'analytics') return <Analytics />
    if (page === 'monthly-report') return <MonthlyReportGenerator />
    return <Admin 
      materials={materials} 
      tickerText={tickerText} 
      setTickerText={setTickerText} 
      activeQuiz={activeQuiz} 
      teamScores={teamScores} 
      setTeamScores={setTeamScores} 
      onGrantAccess={handleGrantAccess} 
      reportSettings={reportSettings} 
      setReportSettings={setReportSettings} 
      onUpdateReportStatus={handleUpdateReportStatus} 
      kbDocuments={kbDocuments} 
    />
  }, [page, materials, tickerText, activeQuiz, teamScores, reportSettings, userName, userEmail, kbDocuments])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])
  if (!loggedIn) return <Login onLogin={(role, name, email) => {
    setUserRole(role)
    if (name) setUserName(name)
    if (email) setUserEmail(email)
    setPage(role === 'counselor' ? 'dashboard' : 'admin')
    setLoggedIn(true)
  }} />
  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} open={menu} close={() => setMenu(false)} userRole={userRole} userName={userName} />
    <main className="app-main">
      <Header page={page} onMenu={() => setMenu(true)} onLogout={() => setLoggedIn(false)} tickerText={tickerText} userName={userName} />
      {content}
    </main>
    {pdfData && <PdfModal title={pdfData.title} fileUrl={pdfData.url} onClose={() => setPdfData(null)} />}
    {selectedCounselorModal && <CounselorDetailModal counselor={selectedCounselorModal} onClose={() => setSelectedCounselorModal(null)} />}
  </div>
}