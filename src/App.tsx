import { useMemo, useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, where, getDocs } from 'firebase/firestore'

type View = 'entry' | 'home' | 'plans' | 'quiz' | 'result' | 'admin' | 'student_dashboard'
type Modal = null | 'roadmap' | 'payment' | 'offer_disabled'
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
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 1 0 7.8" /></>,
  wallet: <><path d="M4 5h14a2 2 0 0 1 2 2v13H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12" /><path d="M20 10h-5a2 2 0 0 0 0 4h5" /></>,
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

const defaultTiers = [
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

function MiniCard({ tier, className = '', member = 'YOUR NAME', number = 'EP-2026-••••' }: { tier: any; className?: string; member?: string; number?: string }) {
  return (
    <div className={`mini-card ${tier.name.toLowerCase()} ${className}`}>
      <div className="card-shine" />
      <div className="mini-top"><span>EduPass</span><span className="contactless">)))</span></div>
      <div className="chip"><i /><i /><i /></div>
      <div className="mini-number">{number}</div>
      <div className="mini-bottom"><span><small>MEMBER</small>{member.toUpperCase()}</span><span><small>VALID THRU</small>12 / 26</span><b>{tier.name}</b></div>
    </div>
  )
}

function Entry({ student, admin, studentLogin }: { student: () => void; admin: () => void; studentLogin: () => void }) {
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
            <small>NEW MEMBER</small><h2>Student Registration</h2>
            <p>Create account, take assessment & claim your virtual EduPass.</p>
            <b>Register Now <Icon name="arrow" /></b>
          </button>
          <button className="role-card student-role" onClick={studentLogin} style={{ borderColor: '#D4AF37' }}>
            <span className="role-icon"><Icon name="shield" size={28} /></span>
            <small>EXISTING MEMBER</small><h2>Student Login</h2>
            <p>Login with User ID & Password to check card status & benefits.</p>
            <b>Login to Account <Icon name="arrow" /></b>
          </button>
          <button className="role-card admin-role" onClick={admin}>
            <span className="role-icon"><Icon name="lock" size={28} /></span>
            <small>AUTHORISED ACCESS</small><h2>Admin Portal</h2>
            <p>System control, card pricing & activation management.</p>
            <b>Access Management <Icon name="arrow" /></b>
          </button>
        </div>
        <div className="entry-foot"><Icon name="lock" size={13} /> Protected portal · EduAimers Bangladesh</div>
      </section>
    </main>
  )
}

function StudentOnboarding({ close, enter, setStudentDetails }: { close: () => void; enter: () => void; setStudentDetails: (details: any) => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    contact: '',
    password: '',
    level: '',
    cgpa: '',
    ielts: '',
    country: '',
    university: '',
    subject: ''
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProceed = async () => {
    setErrorMsg('')
    if (!formData.fullName.trim()) return setErrorMsg('Full name is required!')
    if (!formData.contact.trim() || formData.contact.trim().length < 11) return setErrorMsg('Valid 11-digit contact number (User ID) is required!')
    if (!formData.password.trim() || formData.password.trim().length < 4) return setErrorMsg('Password must be at least 4 characters long!')
    if (!formData.level) return setErrorMsg('Please select your education level!')
    if (!formData.cgpa.trim()) return setErrorMsg('CGPA / GPA is required!')
    if (!formData.country) return setErrorMsg('Preferred country is required!')
    if (!formData.subject.trim()) return setErrorMsg('Preferred subject is required!')

    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, "applicants"), {
        fullName: formData.fullName.trim(),
        contact: formData.contact.trim(),
        password: formData.password.trim(),
        level: formData.level,
        cgpa: formData.cgpa.trim(),
        ielts: formData.ielts || 'N/A',
        country: formData.country,
        university: formData.university || 'N/A',
        subject: formData.subject.trim(),
        status: 'Pending Verification',
        cardTier: 'Gold',
        type: 'INITIAL_ONBOARDING',
        cardNumber: 'EP-2026-••••',
        createdAt: serverTimestamp()
      })

      setStudentDetails({ ...formData, docId: docRef.id, status: 'Pending Verification', cardNumber: 'EP-2026-••••', cardTier: 'Gold', type: 'INITIAL_ONBOARDING' })
      enter()
    } catch (err) {
      console.error("Firebase Error: ", err)
      setErrorMsg("Failed to connect to Firebase. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop onboarding-backdrop" role="dialog" aria-modal="true">
      <div className="modal onboarding-modal">
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        <div className="onboarding-head"><span className="modal-icon"><Icon name="users" /></span><div><div className="section-kicker gold">Create Account & Password</div><h2>Student Registration</h2></div></div>
        <p className="modal-lead">Fill in details and set a password to log in later.</p>
        
        {errorMsg && (
          <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '14px', border: '1px solid rgba(255,77,77,0.3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="form-grid">
          <label><span>Student full name *</span><input placeholder="Enter full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} /></label>
          <label><span>Phone Number (User ID) *</span><input placeholder="01XXXXXXXXX" inputMode="numeric" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></label>
          <label><span>Account Password *</span><input type="password" placeholder="Create secret password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></label>
          <label><span>Last education level *</span>
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
              <option value="" disabled>Select level</option>
              <option value="HSC / A-Levels">HSC / A-Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </label>
          <label><span>CGPA / GPA *</span><input placeholder="e.g. 4.50 / 5.00" value={formData.cgpa} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} /></label>
          <label><span>Preferred country *</span>
            <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
              <option value="" disabled>Select country</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="South Korea">South Korea</option>
            </select>
          </label>
          <label><span>Preferred subject *</span><input placeholder="Subject or programme" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></label>
        </div>
        <button className="primary-btn full-btn" onClick={handleProceed} disabled={loading}>
          {loading ? 'Creating Account...' : 'Register & View Cards'} <Icon name="arrow" />
        </button>
      </div>
    </div>
  )
}

function StudentLogin({ close, setStudentDetails, go }: { close: () => void; setStudentDetails: (details: any) => void; go: (view: View) => void }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!phone.trim() || !password.trim()) return setError('Please enter both Phone Number and Password!')

    setLoading(true)
    try {
      const q = query(collection(db, "applicants"), where("contact", "==", phone.trim()), where("password", "==", password.trim()))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0]
        setStudentDetails({ docId: studentDoc.id, ...studentDoc.data() })
        close()
        go('student_dashboard')
      } else {
        setError('Invalid Phone Number or Password!')
      }
    } catch (err) {
      console.error("Login Error: ", err)
      setError('Error connecting to authentication service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        <span className="modal-icon"><Icon name="users" /></span>
        <div className="section-kicker gold">Student Portal Login</div>
        <h2>Access Member Dashboard</h2>
        <p className="modal-lead">Enter registered phone number and account password.</p>

        {error && (
          <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label className="auth-field">
            <span>Phone Number (User ID)</span>
            <input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="auth-field">
            <span>Account Password</span>
            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>

        <button className="primary-btn full-btn" onClick={handleLogin} disabled={loading} style={{ marginTop: '16px' }}>
          {loading ? 'Authenticating...' : 'Login to Dashboard'} <Icon name="arrow" />
        </button>
      </div>
    </div>
  )
}

function AdminAuth({ close, enter }: { close: () => void; enter: () => void }) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')

  const handleAdminSubmit = () => {
    if (password === 'eduaimers2026') {
      enter()
    } else {
      setError('Incorrect password! Access denied.')
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        <span className="modal-icon"><Icon name="lock" /></span>
        <div className="section-kicker gold">Restricted environment</div>
        <h2>Admin Authentication</h2>
        <p className="modal-lead">Enter master management password to access controls.</p>
        
        {error && (
          <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
            ⚠️ {error}
          </div>
        )}

        <label className="auth-field">
          <span>Admin password *</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input 
              type={visible ? 'text' : 'password'} 
              placeholder="Enter password (eduaimers2026)" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#0A0E17', color: '#fff' }}
            />
            <button onClick={() => setVisible(!visible)} type="button" style={{ padding: '8px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px' }}>{visible ? 'HIDE' : 'SHOW'}</button>
          </div>
        </label>
        <button className="primary-btn full-btn" onClick={handleAdminSubmit} style={{ marginTop: '16px' }}>Access dashboard <Icon name="arrow" /></button>
        <small className="fine-print" style={{ display: 'block', marginTop: '12px', textAlign: 'center', color: '#aaa' }}><Icon name="shield" size={13} /> Master pass: <strong>eduaimers2026</strong></small>
      </div>
    </div>
  )
}

function StudentDashboard({ studentDetails, go, officeDate, activeTiers }: { studentDetails: any; go: (view: View) => void; officeDate: string; activeTiers: any[] }) {
  const currentTier = activeTiers.find(t => t.name === studentDetails.cardTier) || activeTiers[1]
  const isActive = studentDetails.status === 'Active'
  const isDirectPurchase = studentDetails.type === 'DIRECT_PURCHASE'

  return (
    <main className="result-page" style={{ padding: '40px 20px' }}>
      <div className="result-shell" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <div className="section-kicker gold">STUDENT MEMBER DASHBOARD</div>
            <h1 style={{ fontSize: '28px', margin: 0 }}>Welcome back, {studentDetails.fullName || 'Student'}</h1>
          </div>
          <button className="outline-btn" onClick={() => go('entry')} style={{ fontSize: '12px' }}>Logout</button>
        </div>

        <div className="result-grid">
          <div className="locked-card-wrap">
            <MiniCard tier={currentTier} member={studentDetails.fullName} number={studentDetails.cardNumber || 'EP-2026-••••'} />
            {!isActive && (
              <div className="locked-overlay">
                <Icon name="lock" />
                <span>STATUS: {isDirectPurchase ? 'PAYMENT VERIFICATION' : 'PROCESSING'}</span>
                <b>CARD LOCKED · {studentDetails.cardNumber || 'EP-2026-••••'}</b>
              </div>
            )}
          </div>

          <div className="visit-card" style={{ textAlign: 'left' }}>
            <span className="visit-label" style={{ background: isActive ? '#10B981' : isDirectPurchase ? '#E2136E' : '#F59E0B', color: '#fff' }}>
              {isActive ? '✓ CARD ACTIVE & VERIFIED' : isDirectPurchase ? '💳 BKASH VERIFICATION PENDING' : '⏳ APPOINTMENT CONFIRMED'}
            </span>

            {isActive ? (
              <>
                <h2 style={{ color: '#10B981', marginTop: '12px' }}>EduPass Member ID Unlocked!</h2>
                <p>Your privilege pass is live. Present Member ID <strong>{studentDetails.cardNumber}</strong> to claim waivers and discounts.</p>
                <div className="date-box" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }}>
                  <span><small>ACTIVATION DATE</small><b>VERIFIED ACTIVE (1 YEAR)</b></span>
                </div>
              </>
            ) : isDirectPurchase ? (
              <>
                <h2 style={{ marginTop: '12px' }}>bKash Payment Under Verification</h2>
                <p>TrxID: <strong>{studentDetails.trxId}</strong>. EduPass team is verifying your payment. Your Card ID will unlock automatically upon verification.</p>
                <div className="date-box" style={{ background: 'rgba(226, 19, 110, 0.1)', borderColor: '#E2136E' }}>
                  <span><small>PAID AMOUNT</small><b>{studentDetails.paidAmount || 'bKash Merchant Pay'}</b></span>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ marginTop: '12px' }}>Office Visit Scheduled</h2>
                <p>Your appointment is booked! Visit EduAimers office to verify documents & unlock your Member ID for free.</p>
                <div className="date-box">
                  <span><small>APPOINTMENT DATE</small><b>{officeDate}</b></span>
                  <Icon name="chevron" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="notice" style={{ marginTop: '24px' }}>
          <Icon name="shield" />
          <div>
            <b>{currentTier.name} Tier Benefits:</b>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              {currentTier.features.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

function Home({ go, announcement }: { go: (view: View) => void; announcement: string }) {
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="orb orb-one" /><div className="orb orb-two" />
        <div className="hero-content page-width">
          <div style={{ background: 'linear-gradient(90deg, #D4AF37, #F59E0B)', color: '#000', padding: '10px 18px', borderRadius: '30px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
            <Icon name="spark" size={16} /> 🔥 EVENT PROMOTION: <strong>{announcement}</strong>
          </div>

          <h1>Unlock global study &<br /><em>lifestyle privileges.</em></h1>
          <p>One premium membership. Exclusive education benefits, airport assistance, lifestyle rewards and more—crafted for ambitious students.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => go('plans')}>Explore your EduPass <Icon name="arrow" /></button>
            <button className="text-btn" onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>See how it works <span className="play">▶</span></button>
          </div>
        </div>
        <div className="card-stage">
          <div className="stage-ring" />
          <MiniCard tier={defaultTiers[0]} className="card-left" />
          <MiniCard tier={defaultTiers[2]} className="card-right" />
          <MiniCard tier={defaultTiers[1]} className="card-center" />
        </div>
      </section>
    </>
  )
}

function Plans({ setModal, setSelectedTier, announcement, activeTiers, isFreeOfferEnabled }: { setModal: (modal: Modal) => void; setSelectedTier: (tier: TierName) => void; announcement: string; activeTiers: any[]; isFreeOfferEnabled: boolean }) {
  const open = (type: Modal, tier: TierName) => {
    setSelectedTier(tier)
    if (type === 'roadmap' && !isFreeOfferEnabled) {
      setModal('offer_disabled')
    } else {
      setModal(type)
    }
  }

  return (
    <main className="plans">
      <div className="page-width">
        <div style={{ background: 'linear-gradient(90deg, #1C2541, #0B132B)', border: '2px solid #D4AF37', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', boxShadow: '0 0 25px rgba(212,175,55,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: '#D4AF37', color: '#000', padding: '6px 12px', borderRadius: '20px', fontWeight: '900', fontSize: '11px' }}>SPECIAL EVENT</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{announcement}</span>
          </div>
          <span style={{ fontSize: '12px', color: isFreeOfferEnabled ? '#10B981' : '#ff4d4d', fontWeight: 'bold' }}>
            {isFreeOfferEnabled ? '● FREE ASSESSMENT OFFER ACTIVE' : '○ FREE OFFER DISABLED'}
          </span>
        </div>

        <div className="center-heading">
          <div className="section-kicker gold">Choose your access</div>
          <h1>A tier for every ambition.</h1>
          <p>All cards are valid for one year. Choose direct purchase or qualify for free access through our assessment.</p>
        </div>
        <div className="tier-grid">
          {activeTiers.map((tier) => (
            <article className={`tier-card ${tier.popular ? 'featured' : ''}`} key={tier.name}>
              {tier.popular && <span className="popular-label">MOST POPULAR</span>}
              <MiniCard tier={tier} />
              <div className="tier-title"><div><span>{tier.tag}</span><h2>{tier.name}</h2></div><div className="price"><b>৳{tier.price.toLocaleString()}</b><small>/ year</small></div></div>
              <div className="feature-list">
                {tier.features.map((feature: string) => <div key={feature}><span><Icon name="check" size={14} /></span>{feature}</div>)}
              </div>
              <div className="tier-actions">
                <button className="primary-btn" onClick={() => open('payment', tier.name)}>Purchase card <Icon name="arrow" size={17} /></button>
                <button className="outline-btn" onClick={() => open('roadmap', tier.name)}>
                  {isFreeOfferEnabled ? 'Get free via assessment' : 'Free offer unavailable'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

function ModalView({ type, tier, close, startQuiz, studentDetails, setStudentDetails, activeTiers, announcement }: { type: Exclude<Modal, null>; tier: TierName; close: () => void; startQuiz: () => void; studentDetails: any; setStudentDetails: (details: any) => void; activeTiers: any[]; announcement: string }) {
  const [bkashSender, setBkashSender] = useState(studentDetails.contact || '')
  const [trxId, setTrxId] = useState('')
  const [payError, setPayError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tierPrice = activeTiers.find((item) => item.name === tier)?.price || 500

  const handleBkashPayment = async () => {
    setPayError('')
    if (!bkashSender.trim() || bkashSender.trim().length < 11) return setPayError('Please enter valid 11-digit bKash sender number!')
    if (!trxId.trim()) return setPayError('Please enter the bKash Transaction ID (TrxID)!')

    setIsSubmitting(true)
    try {
      if (studentDetails.docId) {
        const docRef = doc(db, "applicants", studentDetails.docId)
        await updateDoc(docRef, {
          cardTier: tier,
          paymentMethod: 'bKash',
          trxId: trxId.trim().toUpperCase(),
          paidAmount: `৳${tierPrice.toLocaleString()}`,
          type: 'DIRECT_PURCHASE'
        })
        setStudentDetails({ ...studentDetails, cardTier: tier, trxId: trxId.trim().toUpperCase(), paidAmount: `৳${tierPrice.toLocaleString()}`, type: 'DIRECT_PURCHASE' })
      } else {
        const docRef = await addDoc(collection(db, "applicants"), {
          fullName: studentDetails.fullName || 'Student',
          contact: bkashSender.trim(),
          cardTier: tier,
          paymentMethod: 'bKash',
          trxId: trxId.trim().toUpperCase(),
          paidAmount: `৳${tierPrice.toLocaleString()}`,
          status: 'Pending Verification',
          type: 'DIRECT_PURCHASE',
          cardNumber: 'EP-2026-••••',
          createdAt: serverTimestamp()
        })
        setStudentDetails({ docId: docRef.id, fullName: studentDetails.fullName || 'Student', contact: bkashSender.trim(), cardTier: tier, trxId: trxId.trim().toUpperCase(), paidAmount: `৳${tierPrice.toLocaleString()}`, type: 'DIRECT_PURCHASE', status: 'Pending Verification', cardNumber: 'EP-2026-••••' })
      }

      alert(`🎉 bKash Payment Request Submitted!\n\nEduPass Team will verify TrxID (${trxId.toUpperCase()}) and unlock your ${tier} Card.`)
      close()
    } catch (err) {
      console.error("Firebase Save Error: ", err)
      setPayError("Error saving payment to database.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal ${type === 'payment' ? 'payment-modal' : ''}`}>
        <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close" /></button>
        {type === 'offer_disabled' ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
            <h2 style={{ color: '#D4AF37', margin: '12px 0 6px 0' }}>Free Assessment Offer Unavailable</h2>
            <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '16px' }}>
              The free assessment card offer is currently turned off by Admin.
            </p>
            <div style={{ background: '#0A0E17', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#D4AF37', border: '1px solid #333' }}>
              📢 Active Promotion Event: <strong>{announcement}</strong>
            </div>
            <button className="primary-btn full-btn" onClick={close} style={{ marginTop: '20px' }}>Understood</button>
          </div>
        ) : type === 'roadmap' ? (
          <>
            <span className="modal-icon"><Icon name="spark" /></span>
            <div className="section-kicker gold">Your free {tier} roadmap</div>
            <h2>Three steps to unlock your card.</h2>
            <div className="roadmap">
              {[
                ['01', '10-min assessment quiz', 'Tell us about your goals and study readiness.'],
                ['02', 'Office visit & counselling', 'Get a personalised plan from our experts.'],
                ['03', 'Card unlock & ID generation', 'Receive your verified EduPass member ID.'],
              ].map(([num, title, text]) => <div className="roadmap-item" key={num}><b>{num}</b><div><h3>{title}</h3><p>{text}</p></div></div>)}
            </div>
            <button className="primary-btn full-btn" onClick={startQuiz}>Start assessment quiz now <Icon name="arrow" /></button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#E2136E' }}>b<span style={{ color: '#000' }}>Kash</span></div>
              <span style={{ background: '#E2136E', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>MERCHANT PAY</span>
            </div>

            <div className="payment-summary" style={{ background: '#FFF0F5', border: '1px solid #FFC0CB', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Selected Tier:</span> <strong>{tier} (1 Year)</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#E2136E', fontWeight: 'bold', marginTop: '4px' }}><span>Amount to Pay:</span> <span>৳{tierPrice.toLocaleString()}</span></div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', fontSize: '11px', margin: '12px 0', borderLeft: '3px solid #E2136E' }}>
              <div>• Merchant No: <strong style={{ color: '#E2136E' }}>01711223344</strong></div>
              <div>• Reference: <strong>{studentDetails.contact || 'YOUR PHONE'}</strong></div>
            </div>

            {payError && <div style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold' }}>⚠️ {payError}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>bKash Sender Mobile Number *</label>
              <input className="text-input" placeholder="01XXXXXXXXX" value={bkashSender} onChange={(e) => setBkashSender(e.target.value)} />
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Transaction ID (TrxID) *</label>
              <input className="text-input" placeholder="e.g. BKS9T4P2Q" value={trxId} onChange={(e) => setTrxId(e.target.value)} />
            </div>

            <button className="bkash-btn" onClick={handleBkashPayment} disabled={isSubmitting} style={{ background: '#E2136E', color: '#fff', width: '100%', padding: '14px', borderRadius: '10px', fontWeight: 'bold', marginTop: '16px', border: 'none' }}>
              {isSubmitting ? 'Processing...' : `Confirm bKash Payment (৳${tierPrice.toLocaleString()})`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Quiz({ finish, studentDetails, setStudentDetails }: { finish: () => void; studentDetails: any; setStudentDetails: (details: any) => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const current = questions[step]
  const selected = answers[step]

  const choose = (option: number) => {
    const next = [...answers]
    next[step] = option
    setAnswers(next)
  }

  const proceed = async () => {
    if (step === questions.length - 1) {
      if (studentDetails.docId) {
        const docRef = doc(db, "applicants", studentDetails.docId)
        await updateDoc(docRef, { type: 'FREE_QUIZ', quizScore: '85%' })
        setStudentDetails({ ...studentDetails, type: 'FREE_QUIZ', quizScore: '85%' })
      }
      finish()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <main className="quiz-page">
      <div className="quiz-top"><Brand light /><div className="timer"><Icon name="clock" size={17} /><span><small>TIME REMAINING</small>09:42</span></div></div>
      <div className="quiz-shell">
        <div className="quiz-meta"><span>ASSESSMENT · {current.category.toUpperCase()}</span><b>{String(step + 1).padStart(2, '0')} <i>/ {String(questions.length).padStart(2, '0')}</i></b></div>
        <div className="progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        <h1>{current.text}</h1>
        <div className="options">
          {current.options.map((option, index) => (
            <button className={selected === index ? 'selected' : ''} onClick={() => choose(index)} key={option}>
              <span>{String.fromCharCode(65 + index)}</span><b>{option}</b><i>{selected === index && <Icon name="check" size={17} />}</i>
            </button>
          ))}
        </div>
        <div className="quiz-footer">
          <button className="back-btn" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          <button className="primary-btn" disabled={selected === undefined} onClick={proceed}>{step === questions.length - 1 ? 'View Result' : 'Next Question'} <Icon name="arrow" /></button>
        </div>
      </div>
    </main>
  )
}

function Result({ tier, officeDate, go, studentName, activeTiers }: { tier: TierName; officeDate: string; go: (view: View) => void; studentName: string; activeTiers: any[] }) {
  const selectedTier = activeTiers.find((item) => item.name === tier) ?? activeTiers[1]
  return (
    <main className="result-page">
      <div className="result-shell">
        <div className="success-mark"><Icon name="check" size={30} /></div>
        <div className="section-kicker gold">Assessment complete</div>
        <h1>You’re one step away, {studentName.split(' ')[0]}.</h1>
        <p>Visit our office on your appointment date to unlock your card ID.</p>
        <div className="result-grid">
          <div className="locked-card-wrap">
            <MiniCard tier={selectedTier} member={studentName} />
            <div className="locked-overlay"><Icon name="lock" /><span>MEMBER ID</span><b>LOCKED · EP-2026-••••</b></div>
          </div>
          <div className="visit-card">
            <span className="visit-label">NEXT STEP</span>
            <h2>Visit EduAimers Office</h2>
            <div className="date-box"><span><small>APPOINTMENT DATE</small><b>{officeDate}</b></span></div>
            <button className="primary-btn full-btn" onClick={() => go('student_dashboard')}>Go to Member Dashboard <Icon name="arrow" /></button>
          </div>
        </div>
      </div>
    </main>
  )
}

function Admin({ officeDate, setOfficeDate, announcement, setAnnouncement, exit, activeTiers, setActiveTiers, isFreeOfferEnabled, setIsFreeOfferEnabled }: { officeDate: string; setOfficeDate: (date: string) => void; announcement: string; setAnnouncement: (value: string) => void; exit: () => void; activeTiers: any[]; setActiveTiers: (tiers: any[]) => void; isFreeOfferEnabled: boolean; setIsFreeOfferEnabled: (enabled: boolean) => void }) {
  const [firebaseApplicants, setFirebaseApplicants] = useState<any[]>([])
  const [recordTab, setRecordTab] = useState<'direct' | 'quiz'>('direct')
  const [selectedTierEdit, setSelectedTierEdit] = useState<TierName>('Gold')
  const [newFeatureInput, setNewFeatureInput] = useState('')
  const [qrUrl, setQrUrl] = useState(typeof window !== 'undefined' ? window.location.origin : 'https://mobashir-ahmed-nasrullah.vercel.app')

  useEffect(() => {
    const q = query(collection(db, "applicants"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirebaseApplicants(docs)
    })
    return () => unsubscribe()
  }, [])

  const activateCard = async (docId: string) => {
    const generatedId = `EP-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const docRef = doc(db, "applicants", docId)
    await updateDoc(docRef, {
      status: 'Active',
      cardNumber: generatedId
    })
  }

  const handleAddFeature = (tierName: TierName) => {
    if (!newFeatureInput.trim()) return
    setActiveTiers(activeTiers.map(t => {
      if (t.name === tierName) {
        return { ...t, features: [...t.features, newFeatureInput.trim()] }
      }
      return t
    }))
    setNewFeatureInput('')
  }

  const handleDeleteFeature = (tierName: TierName, index: number) => {
    setActiveTiers(activeTiers.map(t => {
      if (t.name === tierName) {
        const updated = [...t.features]
        updated.splice(index, 1)
        return { ...t, features: updated }
      }
      return t
    }))
  }

  const directList = firebaseApplicants.filter(a => a.type === 'DIRECT_PURCHASE')
  const quizList = firebaseApplicants.filter(a => a.type !== 'DIRECT_PURCHASE')

  return (
    <main className="admin-page" style={{ padding: '30px' }}>
      <aside className="admin-sidebar" style={{ width: '250px' }}>
        <Brand light />
        <div className="admin-user" style={{ marginTop: '20px' }}>
          <span>AR</span>
          <div><b>Super Admin</b><small>EduPass Manager</small></div>
          <button onClick={exit} style={{ marginTop: '10px' }}>Exit Admin</button>
        </div>
      </aside>

      <div className="admin-main" style={{ marginLeft: '270px' }}>
        <div className="admin-header">
          <h1>EduPass Admin Control Panel</h1>
        </div>

        <div className="admin-tools" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
          <section className="control-card" style={{ background: '#1C2541', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
            <div className="control-head"><h3 style={{ color: '#D4AF37', margin: '0 0 10px 0' }}>📢 Event Manager & Free Offer Switch</h3></div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0E17', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Free Assessment Offer:</span>
              <button onClick={() => setIsFreeOfferEnabled(!isFreeOfferEnabled)} style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: isFreeOfferEnabled ? '#10B981' : '#ff4d4d', color: '#fff' }}>
                {isFreeOfferEnabled ? 'ON (Active)' : 'OFF (Disabled)'}
              </button>
            </div>

            <div className="event-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px' }}>
                <span>Event Banner Highlight Title:</span>
                <input style={{ width: '100%', padding: '8px', background: '#0A0E17', border: '1px solid #444', color: '#fff', borderRadius: '6px' }} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
              </label>
              <label style={{ fontSize: '12px' }}>
                <span>Next Office Appointment Date:</span>
                <input style={{ width: '100%', padding: '8px', background: '#0A0E17', border: '1px solid #444', color: '#fff', borderRadius: '6px' }} value={officeDate} onChange={(e) => setOfficeDate(e.target.value)} />
              </label>
            </div>
          </section>

          {/* DYNAMIC QR CODE LINK UPDATER */}
          <section className="control-card" style={{ background: '#1C2541', padding: '20px', borderRadius: '12px', border: '1px solid #333', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#D4AF37', margin: '0 0 10px 0' }}>📱 Event QR Code Generator</h3>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
                <span>QR Target Website URL:</span>
                <input style={{ width: '100%', padding: '6px', background: '#0A0E17', border: '1px solid #444', color: '#fff', borderRadius: '6px', fontSize: '11px', marginTop: '4px' }} value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="Paste your live web link here" />
              </label>
              <small style={{ fontSize: '10px', color: '#aaa' }}>Paste your live site URL above. Scanning the QR code will direct students immediately to EduPass.</small>
            </div>

            <div style={{ background: '#fff', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrUrl)}`} alt="Event QR Code" style={{ width: '100px', height: '100px' }} />
              <span style={{ fontSize: '9px', color: '#000', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>SCAN QR</span>
            </div>
          </section>
        </div>

        <section className="control-card" style={{ background: '#1C2541', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '20px' }}>
          <div className="control-head"><h3 style={{ color: '#D4AF37', margin: '0 0 10px 0' }}>💳 Card Pricing & Benefits Customizer</h3></div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {(['Platinum', 'Gold', 'Diamond'] as TierName[]).map(t => (
              <button key={t} onClick={() => setSelectedTierEdit(t)} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: selectedTierEdit === t ? '#D4AF37' : '#0A0E17', color: selectedTierEdit === t ? '#000' : '#fff' }}>
                {t}
              </button>
            ))}
          </div>

          {activeTiers.filter(t => t.name === selectedTierEdit).map(tier => (
            <div key={tier.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px' }}>
                <span>Price (BDT):</span>
                <input type="number" style={{ width: '100%', padding: '6px', background: '#0A0E17', border: '1px solid #444', color: '#fff', borderRadius: '6px' }} value={tier.price} onChange={(e) => setActiveTiers(activeTiers.map(t => t.name === tier.name ? { ...t, price: Number(e.target.value) } : t))} />
              </label>

              <div style={{ fontSize: '11px' }}>
                <span>Custom Benefits / Features:</span>
                <ul style={{ margin: '6px 0', padding: '0 0 0 16px', color: '#ccc', maxHeight: '100px', overflowY: 'auto' }}>
                  {tier.features.map((f: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {f} <button onClick={() => handleDeleteFeature(tier.name, i)} style={{ background: 'red', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '9px', cursor: 'pointer', marginLeft: '6px' }}>x</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <input placeholder="Add new benefit..." style={{ flex: 1, padding: '6px', background: '#0A0E17', border: '1px solid #444', color: '#fff', borderRadius: '6px', fontSize: '11px' }} value={newFeatureInput} onChange={(e) => setNewFeatureInput(e.target.value)} />
                  <button onClick={() => handleAddFeature(tier.name)} style={{ padding: '6px 12px', background: '#10B981', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="records" style={{ background: '#1C2541', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <div className="record-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button className={recordTab === 'direct' ? 'active' : ''} onClick={() => setRecordTab('direct')} style={{ padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: recordTab === 'direct' ? '#E2136E' : '#0A0E17', color: '#fff', border: 'none' }}>
              💳 bKash Direct Purchases ({directList.length})
            </button>
            <button className={recordTab === 'quiz' ? 'active' : ''} onClick={() => setRecordTab('quiz')} style={{ padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', background: recordTab === 'quiz' ? '#D4AF37' : '#0A0E17', color: recordTab === 'quiz' ? '#000' : '#fff', border: 'none' }}>
              📝 Free Quiz & Office Visit ({quizList.length})
            </button>
          </div>

          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            {recordTab === 'direct' ? (
              <table style={{ width: '100%', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                    <th style={{ padding: '10px' }}>Student Name</th>
                    <th>Phone (User ID)</th>
                    <th>Tier</th>
                    <th>TrxID</th>
                    <th>Amount</th>
                    <th>Card Number</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {directList.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center' }}>No bKash direct purchases recorded yet.</td></tr>
                  ) : (
                    directList.map((app) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '10px' }}><b>{app.fullName}</b></td>
                        <td>{app.contact}</td>
                        <td><b style={{ color: '#D4AF37' }}>{app.cardTier}</b></td>
                        <td><code style={{ background: '#E2136E', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{app.trxId}</code></td>
                        <td><b>{app.paidAmount}</b></td>
                        <td><strong style={{ letterSpacing: '1px' }}>{app.cardNumber}</strong></td>
                        <td><span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', background: app.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(226,19,110,0.2)', color: app.status === 'Active' ? '#10B981' : '#E2136E' }}>{app.status}</span></td>
                        <td>
                          {app.status === 'Active' ? (
                            <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓ Activated</span>
                          ) : (
                            <button onClick={() => activateCard(app.id)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#10B981', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                              Unlock & Generate ID
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                    <th style={{ padding: '10px' }}>Student Name</th>
                    <th>Phone (User ID)</th>
                    <th>Academic Degree</th>
                    <th>Quiz Score</th>
                    <th>Card Number</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quizList.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>No free quiz holders recorded yet.</td></tr>
                  ) : (
                    quizList.map((app) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '10px' }}><b>{app.fullName}</b></td>
                        <td>{app.contact}</td>
                        <td>{app.level} (CGPA: {app.cgpa})</td>
                        <td><b>{app.quizScore || '85%'}</b></td>
                        <td><strong style={{ letterSpacing: '1px' }}>{app.cardNumber}</strong></td>
                        <td><span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', background: app.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: app.status === 'Active' ? '#10B981' : '#F59E0B' }}>{app.status}</span></td>
                        <td>
                          {app.status === 'Active' ? (
                            <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓ Activated</span>
                          ) : (
                            <button onClick={() => activateCard(app.id)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#D4AF37', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                              Unlock Office Pass
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const [view, setView] = useState<View>('entry')
  const [modal, setModal] = useState<Modal>(null)
  const [gate, setGate] = useState<null | 'student' | 'admin' | 'student_login'>(null)
  const [selectedTier, setSelectedTier] = useState<TierName>('Gold')
  const [studentDetails, setStudentDetails] = useState<any>({})
  const [officeDate, setOfficeDate] = useState('31 October 2026')
  const [announcement, setAnnouncement] = useState('31st October Global Applications Day')
  const [activeTiers, setActiveTiers] = useState(defaultTiers)
  const [isFreeOfferEnabled, setIsFreeOfferEnabled] = useState(true)

  const go = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const fullScreen = view === 'entry' || view === 'quiz' || view === 'admin' || view === 'student_dashboard'

  return (
    <div className="app">
      {!fullScreen && <Nav view={view} go={go} />}
      {view === 'entry' && <Entry student={() => setGate('student')} admin={() => setGate('admin')} studentLogin={() => setGate('student_login')} />}
      {view === 'home' && <Home go={go} announcement={announcement} />}
      {view === 'plans' && <Plans setModal={setModal} setSelectedTier={setSelectedTier} announcement={announcement} activeTiers={activeTiers} isFreeOfferEnabled={isFreeOfferEnabled} />}
      {view === 'quiz' && <Quiz finish={() => go('result')} studentDetails={studentDetails} setStudentDetails={setStudentDetails} />}
      {view === 'result' && <Result tier={selectedTier} officeDate={officeDate} go={go} studentName={studentDetails.fullName || 'Student'} activeTiers={activeTiers} />}
      {view === 'student_dashboard' && <StudentDashboard studentDetails={studentDetails} go={go} officeDate={officeDate} activeTiers={activeTiers} />}
      {view === 'admin' && <Admin officeDate={officeDate} setOfficeDate={setOfficeDate} announcement={announcement} setAnnouncement={setAnnouncement} exit={() => go('entry')} activeTiers={activeTiers} setActiveTiers={setActiveTiers} isFreeOfferEnabled={isFreeOfferEnabled} setIsFreeOfferEnabled={setIsFreeOfferEnabled} />}
      {modal && <ModalView type={modal} tier={selectedTier} close={() => setModal(null)} startQuiz={() => { setModal(null); go('quiz') }} studentDetails={studentDetails} setStudentDetails={setStudentDetails} activeTiers={activeTiers} announcement={announcement} />}
      {gate === 'student' && <StudentOnboarding close={() => setGate(null)} setStudentDetails={setStudentDetails} enter={() => { setGate(null); go('plans') }} />}
      {gate === 'student_login' && <StudentLogin close={() => setGate(null)} setStudentDetails={setStudentDetails} go={go} />}
      {gate === 'admin' && <AdminAuth close={() => setGate(null)} enter={() => { setGate(null); go('admin') }} />}
    </div>
  )
}