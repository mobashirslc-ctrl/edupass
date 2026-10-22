import { useMemo, useState } from 'react'

type View = 'entry' | 'home' | 'plans' | 'quiz' | 'result' | 'admin'
type Modal = null | 'roadmap' | 'payment'
type TierName = 'Platinum' | 'Gold' | 'Diamond'

type IconName =
  | 'arrow'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'edit'
  | 'gift'
  | 'globe'
  | 'lock'
  | 'menu'
  | 'shield'
  | 'spark'
  | 'users'
  | 'wallet'

const iconPaths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  edit: <><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" /></>,
  gift: <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M7.5 8C4 8 4 3 7 3c2.5 0 5 5 5 5M16.5 8C20 8 20 3 17 3c-2.5 0-5 5-5 5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  spark: <><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  wallet: <><path d="M4 5h14a2 2 0 0 1 2 2v13H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12" /><path d="M20 10h-5a2 2 0 0 0 0 4h5" /></>,
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

const tiers = [
  {
    name: 'Platinum' as TierName,
    price: 500,
    tag: 'Smart starter',
    code: '01',
    features: [
      'Free corporate grooming pass',
      'Up to 20% application fee waiver',
      '30% file opening cashback',
      'Standard counselling',
      '10% fashion & food discounts',
      'BDT 5,000 shopping voucher',
    ],
  },
  {
    name: 'Gold' as TierName,
    price: 1000,
    tag: 'Most popular',
    code: '02',
    popular: true,
    features: [
      'Free grooming pass + networking',
      'Up to 35% application fee waiver',
      '50% file opening cashback',
      'VIP fast-track counselling',
      '20% fashion/food + 3-month Chorki',
      'BDT 15,000 shopping voucher',
    ],
  },
  {
    name: 'Diamond' as TierName,
    price: 2000,
    tag: 'Maximum access',
    code: '03',
    features: [
      'Grooming + networking + SOP/CV redesign',
      '50% fee waiver + 100% IELTS cashback',
      '80% cashback + 50% service charge off',
      'VIP counselling, mock visa & airport pickup',
      '30% fashion/food + 1-year premium streaming',
      'BDT 30,000 voucher + laptop eligibility',
    ],
  },
]

const questions = [
  { category: 'Study plan', text: 'Which destination are you most interested in for higher studies?', options: ['United Kingdom', 'Canada', 'Australia', 'Not decided yet'] },
  { category: 'Academic profile', text: 'What is your current stage of education?', options: ['HSC / A-Levels', 'Undergraduate', 'Postgraduate', 'Recently graduated'] },
  { category: 'English readiness', text: 'Have you completed an English proficiency test?', options: ['IELTS completed', 'Preparing now', 'Planning to start', 'Need guidance'] },
  { category: 'Timeline', text: 'When would you ideally like to begin your studies abroad?', options: ['Within 3 months', 'Within 6 months', 'Within 12 months', 'Still exploring'] },
]

function Brand({ light = false }: { light?: boolean }) {
  return (
    <button className={`brand ${light ? 'brand-light' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="EduPass home">
      <img src="/eduaimers-logo.png" alt="EduAimers" />
      <span><b>EDUPASS</b><small>VIRTUAL PRIVILEGE</small></span>
    </button>
  )
}

function Nav({ view, go }: { view: View; go: (view: View) => void }) {
  const [open, setOpen] = useState(false)
  const nav = (next: View) => { go(next); setOpen(false) }
  return (
    <header className="nav-shell">
      <nav className="nav-wrap">
        <Brand />
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Open menu"><Icon name={open ? 'close' : 'menu'} /></button>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          <button className={view === 'home' ? 'active' : ''} onClick={() => nav('home')}>Home</button>
          <button className={view === 'plans' ? 'active' : ''} onClick={() => nav('plans')}>Card benefits</button>
          <button onClick={() => nav('home')}>How it works</button>
          <button onClick={() => nav('entry')}>Switch portal</button>
          <button className="nav-cta" onClick={() => nav('plans')}>Get EduPass <Icon name="arrow" size={16} /></button>
        </div>
      </nav>
    </header>
  )
}

function MiniCard({ tier, className = '', member = 'YOUR NAME' }: { tier: (typeof tiers)[number]; className?: string; member?: string }) {
  return (
    <div className={`mini-card ${tier.name.toLowerCase()} ${className}`}>
      <div className="card-shine" />
      <div className="mini-top"><span>EduPass</span><span className="contactless">)))</span></div>
      <div className="chip"><i /><i /><i /></div>
      <div className="mini-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; {tier.code}26</div>
      <div className="mini-bottom"><span><small>MEMBER</small>{member.toUpperCase()}</span><span><small>VALID THRU</small>12 / 26</span><b>{tier.name}</b></div>
    </div>
  )
}

function Entry({ student, admin }: { student: () => void; admin: () => void }) {
  return (
    <main className="entry-page">
      <div className="entry-grid" />
      <div className="entry-orb" />
      <header className="entry-top"><Brand light /><span>SECURE ROLE ACCESS <Icon name="shield" size={16} /></span></header>
      <section className="entry-content">
        <div className="section-kicker gold">EduAimers digital ecosystem</div>
        <h1>Welcome to EduPass<br /><em>Privilege Portal.</em></h1>
        <p>Select your access point to continue to the secure privilege and management environment.</p>
        <div className="role-grid">
          <button className="role-card student-role" onClick={student}>
            <span className="role-icon"><Icon name="users" size={28} /></span>
            <small>MEMBER ACCESS</small><h2>Student Entry</h2>
            <p>Access assessment quiz & claim your virtual EduPass.</p>
            <b>Enter student portal <Icon name="arrow" /></b>
          </button>
          <button className="role-card admin-role" onClick={admin}>
            <span className="role-icon"><Icon name="lock" size={28} /></span>
            <small>AUTHORISED ACCESS</small><h2>Admin Portal</h2>
            <p>System control, card pricing & activation management.</p>
            <b>Access management <Icon name="arrow" /></b>
          </button>
        </div>
        <div className="entry-foot"><Icon name="lock" size={13} /> Protected portal · EduAimers Bangladesh</div>
      </section>
    </main>
  )
}

function StudentOnboarding({ close, enter, setName }: { close: () => void; enter: () => void; setName: (name: string) => void }) {
  const [name, updateName] = useState('')
  return (
    <div className="modal-backdrop onboarding-backdrop" role="dialog" aria-modal="true">
      <div className="modal onboarding-modal">
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        <div className="onboarding-head"><span className="modal-icon"><Icon name="users" /></span><div><div className="section-kicker gold">No password required</div><h2>Create your student profile.</h2></div></div>
        <p className="modal-lead">A few details help us personalise your EduPass recommendations.</p>
        <div className="form-grid">
          <label><span>Student full name</span><input placeholder="Enter full name" value={name} onChange={(event) => updateName(event.target.value)} /></label>
          <label><span>Contact number</span><input placeholder="01XXXXXXXXX" inputMode="numeric" /></label>
          <label><span>Last education level</span><select defaultValue=""><option value="" disabled>Select level</option><option>HSC / A-Levels</option><option>Undergraduate</option><option>Postgraduate</option></select></label>
          <label><span>CGPA / GPA</span><input placeholder="e.g. 4.50 / 5.00" /></label>
          <label><span>IELTS score</span><select defaultValue=""><option value="" disabled>Select if applicable</option><option>Not taken</option><option>5.5 – 6.0</option><option>6.5 – 7.0</option><option>7.5+</option></select></label>
          <label><span>Preferred country</span><select defaultValue=""><option value="" disabled>Select country</option><option>United Kingdom</option><option>United States</option><option>Canada</option><option>Australia</option><option>South Korea</option></select></label>
          <label><span>Preferred university</span><input placeholder="University name" /></label>
          <label><span>Preferred subject</span><input placeholder="Subject or programme" /></label>
        </div>
        <button className="primary-btn full-btn" onClick={() => { setName(name || 'Ayesha Rahman'); enter() }}>Enter EduPass portal <Icon name="arrow" /></button>
        <small className="fine-print"><Icon name="shield" size={13} /> Your information is used only for counselling and eligibility.</small>
      </div>
    </div>
  )
}

function AdminAuth({ close, enter }: { close: () => void; enter: () => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        <span className="modal-icon"><Icon name="lock" /></span>
        <div className="section-kicker gold">Restricted environment</div>
        <h2>Admin authentication</h2>
        <p className="modal-lead">Enter the management password to access applicant records and activation controls.</p>
        <label className="auth-field"><span>Admin password</span><div><input type={visible ? 'text' : 'password'} placeholder="Enter secure password" /><button onClick={() => setVisible(!visible)}>{visible ? 'HIDE' : 'SHOW'}</button></div></label>
        <button className="primary-btn full-btn" onClick={enter}>Access dashboard <Icon name="arrow" /></button>
        <small className="fine-print"><Icon name="shield" size={13} /> Demo environment · Any password will continue</small>
      </div>
    </div>
  )
}

function Home({ go }: { go: (view: View) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="orb orb-one" /><div className="orb orb-two" />
        <div className="hero-content page-width">
          <div className="eyebrow"><span><Icon name="spark" size={15} /></span> Your passport to more</div>
          <h1>Unlock global study &<br /><em>lifestyle privileges.</em></h1>
          <p>One premium membership. Exclusive education benefits, airport assistance, lifestyle rewards and more—crafted for ambitious students.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => go('plans')}>Explore your EduPass <Icon name="arrow" /></button>
            <button className="text-btn" onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>See how it works <span className="play">▶</span></button>
          </div>
          <div className="hero-proof">
            <div className="avatars"><span>RA</span><span>SN</span><span>AM</span></div>
            <p><b>1,200+ students</b><small>already unlocking more</small></p>
          </div>
        </div>
        <div className="card-stage">
          <div className="stage-ring" />
          <MiniCard tier={tiers[0]} className="card-left" />
          <MiniCard tier={tiers[2]} className="card-right" />
          <MiniCard tier={tiers[1]} className="card-center" />
          <div className="float-pill pill-one"><Icon name="gift" size={17} /> Up to ৳30K rewards</div>
          <div className="float-pill pill-two"><Icon name="globe" size={17} /> Global privileges</div>
        </div>
        <div className="scroll-note"><span /> SCROLL TO DISCOVER</div>
      </section>

      <section className="trust-strip">
        <div className="page-width trust-inner">
          <span>ONE CARD. MORE POSSIBILITIES.</span>
          <div><b>20%</b><small>Academic fee waiver</small></div>
          <div><b>80%</b><small>File opening cashback</small></div>
          <div><b>30%</b><small>Lifestyle savings</small></div>
          <div><b>1 yr</b><small>Membership validity</small></div>
        </div>
      </section>

      <section className="journey page-width" id="journey">
        <div className="section-kicker">A smarter student journey</div>
        <div className="journey-heading">
          <h2>One card. Every advantage.</h2>
          <p>From your first counselling session to landing at your study destination, EduPass is designed to move with you.</p>
        </div>
        <div className="journey-grid">
          {[
            ['01', 'Assess', 'Take a focused 10-minute eligibility assessment from anywhere.'],
            ['02', 'Connect', 'Meet our expert counsellors and build your personalised roadmap.'],
            ['03', 'Unlock', 'Activate your EduPass ID and start enjoying every privilege.'],
          ].map(([num, title, text], index) => (
            <div className="journey-card" key={title}>
              <span className="step-num">{num}</span>
              <div className="step-icon"><Icon name={index === 0 ? 'edit' : index === 1 ? 'users' : 'shield'} /></div>
              <h3>{title}</h3><p>{text}</p>
              {index < 2 && <div className="step-line"><Icon name="chevron" size={16} /></div>}
            </div>
          ))}
        </div>
        <button className="primary-btn dark-btn" onClick={() => go('plans')}>Compare all cards <Icon name="arrow" /></button>
      </section>
    </>
  )
}

function Plans({ setModal, setSelectedTier, announcement }: { setModal: (modal: Modal) => void; setSelectedTier: (tier: TierName) => void; announcement: string }) {
  const open = (modal: Modal, tier: TierName) => { setSelectedTier(tier); setModal(modal) }
  return (
    <main className="plans">
      <div className="page-width">
        <div className="announcement"><span><Icon name="spark" size={15} /> UPCOMING EVENT</span><b>{announcement}</b><button>View details <Icon name="arrow" size={14} /></button></div>
        <div className="center-heading">
          <div className="section-kicker gold">Choose your access</div>
          <h1>A tier for every ambition.</h1>
          <p>All cards are valid for one year. Choose direct purchase or qualify for free access through our assessment.</p>
        </div>
        <div className="tier-grid">
          {tiers.map((tier) => (
            <article className={`tier-card ${tier.popular ? 'featured' : ''}`} key={tier.name}>
              {tier.popular && <span className="popular-label">MOST POPULAR</span>}
              <MiniCard tier={tier} />
              <div className="tier-title"><div><span>{tier.tag}</span><h2>{tier.name}</h2></div><div className="price"><b>৳{tier.price.toLocaleString()}</b><small>/ year</small></div></div>
              <div className="feature-list">
                {tier.features.map((feature) => <div key={feature}><span><Icon name="check" size={14} /></span>{feature}</div>)}
              </div>
              <div className="tier-actions">
                <button className="primary-btn" onClick={() => open('payment', tier.name)}>Purchase card <Icon name="arrow" size={17} /></button>
                <button className="outline-btn" onClick={() => open('roadmap', tier.name)}>Get free via assessment</button>
              </div>
            </article>
          ))}
        </div>
        <div className="assurance-row">
          <span><Icon name="shield" /> Secure activation</span><span><Icon name="clock" /> Valid for 1 year</span><span><Icon name="wallet" /> Transparent pricing</span>
        </div>
      </div>
    </main>
  )
}

function ModalView({ type, tier, close, startQuiz }: { type: Exclude<Modal, null>; tier: TierName; close: () => void; startQuiz: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal ${type === 'payment' ? 'payment-modal' : ''}`}>
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        {type === 'roadmap' ? (
          <>
            <span className="modal-icon"><Icon name="spark" /></span>
            <div className="section-kicker gold">Your free {tier} roadmap</div>
            <h2>Three steps to unlock your card.</h2>
            <p className="modal-lead">Complete a short assessment and meet our expert counsellors. No payment required.</p>
            <div className="roadmap">
              {[
                ['01', '10-min assessment quiz', 'Tell us about your goals and study readiness.'],
                ['02', 'Office visit & counselling', 'Get a personalised plan from our experts.'],
                ['03', 'Card unlock & ID generation', 'Receive your verified EduPass member ID.'],
              ].map(([num, title, text]) => <div className="roadmap-item" key={num}><b>{num}</b><div><h3>{title}</h3><p>{text}</p></div></div>)}
            </div>
            <button className="primary-btn full-btn" onClick={startQuiz}>Start assessment quiz now <Icon name="arrow" /></button>
            <small className="fine-print">No payment needed · Takes approximately 10 minutes</small>
          </>
        ) : (
          <>
            <div className="bkash-logo">b<span>Kash</span></div>
            <div className="section-kicker gold">Secure checkout</div>
            <h2>Purchase {tier} EduPass</h2>
            <div className="payment-summary"><span>One-year membership</span><b>৳{tiers.find((item) => item.name === tier)?.price.toLocaleString()}</b></div>
            <label className="field-label">bKash mobile number</label>
            <input className="text-input" placeholder="01XXXXXXXXX" inputMode="numeric" />
            <button className="bkash-btn" onClick={close}>Proceed with bKash</button>
            <div className="secure-note"><Icon name="lock" size={16} /> This is a visual payment demo. No charge will be made.</div>
          </>
        )}
      </div>
    </div>
  )
}

function Quiz({ finish }: { finish: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const current = questions[step]
  const selected = answers[step]
  const choose = (option: number) => {
    const next = [...answers]
    next[step] = option
    setAnswers(next)
  }
  const proceed = () => step === questions.length - 1 ? finish() : setStep(step + 1)
  return (
    <main className="quiz-page">
      <div className="quiz-top"><Brand light /><div className="timer"><Icon name="clock" size={17} /><span><small>TIME REMAINING</small>09:42</span></div></div>
      <div className="quiz-shell">
        <div className="quiz-meta"><span>ASSESSMENT · {current.category.toUpperCase()}</span><b>{String(step + 1).padStart(2, '0')} <i>/ {String(questions.length).padStart(2, '0')}</i></b></div>
        <div className="progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        <h1>{current.text}</h1>
        <p className="quiz-hint">Select the answer that best describes you.</p>
        <div className="options">
          {current.options.map((option, index) => (
            <button className={selected === index ? 'selected' : ''} onClick={() => choose(index)} key={option}>
              <span>{String.fromCharCode(65 + index)}</span><b>{option}</b><i>{selected === index && <Icon name="check" size={17} />}</i>
            </button>
          ))}
        </div>
        <div className="quiz-footer">
          <button className="back-btn" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          <button className="primary-btn" disabled={selected === undefined} onClick={proceed}>{step === questions.length - 1 ? 'View my result' : 'Next question'} <Icon name="arrow" /></button>
        </div>
      </div>
    </main>
  )
}

function Result({ tier, officeDate, go, studentName }: { tier: TierName; officeDate: string; go: (view: View) => void; studentName: string }) {
  const selectedTier = tiers.find((item) => item.name === tier) ?? tiers[1]
  const [confirmed, setConfirmed] = useState(false)
  return (
    <main className="result-page">
      <div className="result-shell">
        <div className="success-mark"><Icon name="check" size={30} /></div>
        <div className="section-kicker gold">Assessment complete</div>
        <h1>You’re one step away, {studentName.split(' ')[0]}.</h1>
        <p>Your profile is eligible for an EduPass. Visit our office to complete counselling and activate your member privileges.</p>
        <div className="result-grid">
          <div className="locked-card-wrap">
            <MiniCard tier={selectedTier} member={studentName} />
            <div className="locked-overlay"><Icon name="lock" /><span>MEMBER ID</span><b>LOCKED · EP-2026-••••</b></div>
          </div>
          <div className="visit-card">
            <span className="visit-label">NEXT STEP</span>
            <h2>Visit EduAimers office</h2>
            <p>Meet your counsellor and bring a copy of your latest academic transcript.</p>
            <div className="date-box"><span><small>APPOINTMENT DATE</small><b>{officeDate}</b></span><Icon name="chevron" /></div>
            <button className="primary-btn full-btn" onClick={() => setConfirmed(true)}>{confirmed ? 'Appointment confirmed' : 'Confirm office visit'} <Icon name={confirmed ? 'check' : 'arrow'} /></button>
          </div>
        </div>
        <div className="notice"><Icon name="lock" /><p><b>Your Member ID is protected.</b> It will be generated only after your office visit and admin approval.</p></div>
        <button className="text-return" onClick={() => go('home')}>Return to homepage</button>
      </div>
    </main>
  )
}

type Student = { name: string; contact: string; id: string; card: TierName; status: 'Pending' | 'Active'; score: string; slot: string }

function Admin({ officeDate, setOfficeDate, announcement, setAnnouncement, exit }: { officeDate: string; setOfficeDate: (date: string) => void; announcement: string; setAnnouncement: (value: string) => void; exit: () => void }) {
  const [students, setStudents] = useState<Student[]>([
    { name: 'Ayesha Rahman', contact: '01712 345 678', id: 'EP-2026-••••', card: 'Gold', score: '86%', slot: '31 Oct · 10:30', status: 'Pending' },
    { name: 'Nafis Ahmed', contact: '01898 672 453', id: 'EP-2026-1048', card: 'Diamond', score: '92%', slot: '31 Oct · 11:00', status: 'Active' },
    { name: 'Sadia Khan', contact: '01655 091 247', id: 'EP-2026-••••', card: 'Platinum', score: '78%', slot: '01 Nov · 12:30', status: 'Pending' },
  ])
  const [prices, setPrices] = useState(tiers.map(({ name, price }) => ({ name, price })))
  const [perks, setPerks] = useState('Study abroad waiver · Lifestyle offers · Premium subscriptions')
  const [recordTab, setRecordTab] = useState<'direct' | 'quiz'>('quiz')
  const active = useMemo(() => students.filter((student) => student.status === 'Active').length, [students])
  const approve = (index: number) => setStudents(students.map((student, i) => i === index ? { ...student, id: `EP-2026-${1050 + i}`, status: 'Active' } : student))
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Brand light />
        <div className="admin-nav"><span>MANAGEMENT</span><button className="active"><Icon name="users" /> Overview</button><button><Icon name="wallet" /> Cards & pricing</button><button><Icon name="edit" /> Applicants</button></div>
        <div className="admin-user"><span>AR</span><div><b>Admin User</b><small>Super administrator</small></div><button onClick={exit}>Exit</button></div>
      </aside>
      <div className="admin-main">
        <div className="admin-header"><div><span>MANAGEMENT CONTROL PANEL</span><h1>Good morning, Admin.</h1></div><button className="outline-btn">Export records</button></div>
        <div className="stat-grid">
          <div><span>Total students <Icon name="users" /></span><b>{students.length + 1245}</b><small>+12% this month</small></div>
          <div><span>Active cards <Icon name="shield" /></span><b>{active + 891}</b><small>71.4% activation rate</small></div>
          <div><span>Pending approval <Icon name="clock" /></span><b>{students.length - active + 35}</b><small>Requires attention</small></div>
        </div>
        <div className="admin-tools">
          <section className="control-card">
            <div className="control-head"><div><span>EVENT MANAGER</span><h2>Announcement & office slot</h2></div><Icon name="edit" /></div>
            <div className="event-fields"><label><span>Student banner message</span><input value={announcement} onChange={(event) => setAnnouncement(event.target.value)} /></label><label><span>Next office visit</span><input value={officeDate} onChange={(event) => setOfficeDate(event.target.value)} /></label></div>
            <small>Changes update student banners and result screens instantly.</small>
          </section>
          <section className="control-card">
            <div className="control-head"><div><span>CARD SETTINGS</span><h2>Facility & pricing</h2></div><Icon name="wallet" /></div>
            <div className="price-editor">
              {prices.map((item, index) => <label key={item.name}><span>{item.name}</span><div>৳ <input type="number" value={item.price} onChange={(event) => setPrices(prices.map((price, i) => i === index ? { ...price, price: Number(event.target.value) } : price))} /></div></label>)}
            </div>
            <label className="perk-editor"><span>Included facilities</span><textarea value={perks} onChange={(event) => setPerks(event.target.value)} /></label>
          </section>
        </div>
        <section className="records">
          <div className="records-head"><div><span>STUDENT APPLICANTS</span><h2>Activation management</h2></div><div className="search">Search by name or ID</div></div>
          <div className="record-tabs"><button className={recordTab === 'direct' ? 'active' : ''} onClick={() => setRecordTab('direct')}>Direct purchase <span>24</span></button><button className={recordTab === 'quiz' ? 'active' : ''} onClick={() => setRecordTab('quiz')}>Free quiz holders <span>{students.length}</span></button></div>
          <div className="table-wrap">
            {recordTab === 'quiz' ? <table>
              <thead><tr><th>Student</th><th>Card tier</th><th>Quiz score</th><th>Office slot</th><th>Member ID / status</th><th>Action</th></tr></thead>
              <tbody>{students.map((student, index) => <tr key={student.contact}><td><b>{student.name}</b><small>{student.contact}</small></td><td>{student.card}</td><td><b>{student.score}</b></td><td>{student.slot}</td><td><code>{student.id}</code><span className={`status ${student.status.toLowerCase()}`}>{student.status}</span></td><td>{student.status === 'Pending' ? <button className="approve-btn" onClick={() => approve(index)}>Activate & generate number</button> : <span className="approved"><Icon name="check" size={15} /> Active · 1 year</span>}</td></tr>)}</tbody>
            </table> : <table>
              <thead><tr><th>Student</th><th>Card tier</th><th>Payment</th><th>TrxID</th><th>Paid amount</th><th>Validity</th></tr></thead>
              <tbody>{[['Rafi Hasan','01755 891 201','Diamond','BKS9T4P2Q','৳2,000'],['Maliha Noor','01987 110 245','Gold','BKS4D7X9L','৳1,000'],['Tahsin Alam','01302 684 993','Platinum','BKS2R8M6V','৳500']].map((row) => <tr key={row[1]}><td><b>{row[0]}</b><small>{row[1]}</small></td><td>{row[2]}</td><td>bKash</td><td><code>{row[3]}</code></td><td><b>{row[4]}</b></td><td><span className="valid-badge">1 year</span></td></tr>)}</tbody>
            </table>}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const [view, setView] = useState<View>('entry')
  const [modal, setModal] = useState<Modal>(null)
  const [gate, setGate] = useState<null | 'student' | 'admin'>(null)
  const [selectedTier, setSelectedTier] = useState<TierName>('Gold')
  const [studentName, setStudentName] = useState('Ayesha Rahman')
  const [officeDate, setOfficeDate] = useState('31 October 2026')
  const [announcement, setAnnouncement] = useState('31st October Global Applications Day')
  const go = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const fullScreen = view === 'entry' || view === 'quiz' || view === 'admin'
  return (
    <div className="app">
      {!fullScreen && <Nav view={view} go={go} />}
      {view === 'entry' && <Entry student={() => setGate('student')} admin={() => setGate('admin')} />}
      {view === 'home' && <Home go={go} />}
      {view === 'plans' && <Plans setModal={setModal} setSelectedTier={setSelectedTier} announcement={announcement} />}
      {view === 'quiz' && <Quiz finish={() => go('result')} />}
      {view === 'result' && <Result tier={selectedTier} officeDate={officeDate} go={go} studentName={studentName} />}
      {view === 'admin' && <Admin officeDate={officeDate} setOfficeDate={setOfficeDate} announcement={announcement} setAnnouncement={setAnnouncement} exit={() => go('entry')} />}
      {modal && <ModalView type={modal} tier={selectedTier} close={() => setModal(null)} startQuiz={() => { setModal(null); go('quiz') }} />}
      {gate === 'student' && <StudentOnboarding close={() => setGate(null)} setName={setStudentName} enter={() => { setGate(null); go('plans') }} />}
      {gate === 'admin' && <AdminAuth close={() => setGate(null)} enter={() => { setGate(null); go('admin') }} />}
    </div>
  )
}
