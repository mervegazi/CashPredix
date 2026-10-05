import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">CashPredix</span>
          </a>
        </div>
        <div className="flex flex-1 justify-end items-center gap-x-4">
          <Link to="/login" className="text-sm font-semibold leading-6 text-gray-300 px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-800 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="text-sm font-semibold leading-6 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 text-white transition-colors">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#10b981] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-float"></div>
        </div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#10b981] to-[#3b82f6] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-float-delayed"></div>
        </div>

        {/* Financial Watermark Graphics */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden opacity-[0.06] pointer-events-none animate-float-delayed" aria-hidden="true">
          <svg className="w-full h-full min-w-[1200px]" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" opacity="0.3">
              <path d="M0 100 L1200 100" />
              <path d="M0 200 L1200 200" />
              <path d="M0 300 L1200 300" />
              <path d="M0 400 L1200 400" />
              <path d="M0 500 L1200 500" />
              <path d="M200 0 L200 600" />
              <path d="M400 0 L400 600" />
              <path d="M600 0 L600 600" />
              <path d="M800 0 L800 600" />
              <path d="M1000 0 L1000 600" />
            </g>
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            
            {/* Center Area Chart (Scaled Down) */}
            <g transform="translate(350, 180) scale(0.45)">
              <path d="M0 500 Q 150 450 300 480 T 600 350 T 900 200 T 1200 100 L 1200 600 L 0 600 Z" fill="url(#chart-gradient)" opacity="0.4" />
              <path d="M0 500 Q 150 450 300 480 T 600 350 T 900 200 T 1200 100" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="300" cy="480" r="8" fill="currentColor" />
              <circle cx="600" cy="350" r="8" fill="currentColor" />
              <circle cx="900" cy="200" r="8" fill="currentColor" />
              <g fill="currentColor" stroke="currentColor" strokeWidth="3" opacity="0.8">
                <line x1="100" y1="400" x2="100" y2="480" /><rect x="92" y="420" width="16" height="40" />
                <line x1="200" y1="460" x2="200" y2="520" /><rect x="192" y="470" width="16" height="25" />
                <line x1="450" y1="360" x2="450" y2="440" /><rect x="442" y="380" width="16" height="35" />
                <line x1="750" y1="220" x2="750" y2="300" /><rect x="742" y="240" width="16" height="45" />
                <line x1="1050" y1="100" x2="1050" y2="180" /><rect x="1042" y="110" width="16" height="30" />
              </g>
              <g fill="currentColor" fontFamily="monospace" fontSize="28" fontWeight="bold" opacity="0.9">
                <text x="250" y="430">$45,230</text><text x="250" y="460" fontSize="20" opacity="0.7">+1.2%</text>
                <text x="550" y="290">$89,400</text><text x="550" y="320" fontSize="20" opacity="0.7">+5.8%</text>
                <text x="850" y="140">$124,800</text><text x="850" y="170" fontSize="20" opacity="0.7">+12.4%</text>
                <text x="1080" y="60">$156,000</text><text x="1080" y="90" fontSize="20" opacity="0.7">+8.1%</text>
              </g>
            </g>

            {/* Top-Right Donut Chart */}
            <g transform="translate(1000, 200)">
              <g className="animate-spin-slow">
                <circle cx="0" cy="0" r="100" stroke="currentColor" strokeWidth="2" strokeDasharray="10 20" opacity="0.4" fill="none" />
                <circle cx="0" cy="0" r="115" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" opacity="0.2" fill="none" />
              </g>
              <circle cx="0" cy="0" r="70" stroke="currentColor" strokeWidth="20" strokeDasharray="300 440" opacity="0.7" strokeLinecap="round" transform="rotate(-90)" fill="none" />
              <circle cx="0" cy="0" r="70" stroke="currentColor" strokeWidth="20" strokeDasharray="100 440" opacity="0.4" strokeLinecap="round" transform="rotate(130)" fill="none" />
              <circle cx="0" cy="0" r="70" stroke="currentColor" strokeWidth="20" strokeDasharray="40 440" opacity="0.2" strokeLinecap="round" transform="rotate(250)" fill="none" />
              <text x="0" y="-5" fill="currentColor" fontSize="28" fontFamily="monospace" fontWeight="bold" textAnchor="middle">98%</text>
              <text x="0" y="20" fill="currentColor" fontSize="14" fontFamily="monospace" opacity="0.7" textAnchor="middle">SCORE</text>
            </g>

            {/* Bottom-Left Animated Bar Chart */}
            <g transform="translate(100, 400) scale(0.9)">
              <text x="0" y="-20" fill="currentColor" fontSize="18" fontFamily="monospace" opacity="0.6">MONTHLY CASH FLOW (NET)</text>
              <line x1="0" y1="150" x2="300" y2="150" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              <g fill="currentColor" opacity="0.8">
                <rect x="20" y="80" width="25" height="70" className="animate-bar-1" />
                <rect x="65" y="50" width="25" height="100" className="animate-bar-2" />
                <rect x="110" y="100" width="25" height="50" className="animate-bar-3" />
                <rect x="155" y="20" width="25" height="130" className="animate-bar-4" />
                <rect x="200" y="60" width="25" height="90" className="animate-bar-5" />
                <rect x="245" y="10" width="25" height="140" className="animate-bar-1" />
              </g>
            </g>

            {/* Top-Left Horizontal Vendor Scores */}
            <g transform="translate(100, 120)">
              <g className="animate-float">
                <text x="0" y="-10" fill="currentColor" fontSize="16" fontFamily="monospace" opacity="0.6">TOP VENDOR SCORES</text>
                {/* Vendor 1 */}
                <text x="0" y="20" fill="currentColor" fontSize="14" opacity="0.8">GlobalTech</text>
                <rect x="100" y="8" width="180" height="12" fill="currentColor" opacity="0.2" rx="6" />
                <rect x="100" y="8" width="165" height="12" fill="currentColor" opacity="0.8" rx="6" />
                <text x="290" y="20" fill="currentColor" fontSize="14" fontWeight="bold">92</text>
                
                {/* Vendor 2 */}
                <text x="0" y="50" fill="currentColor" fontSize="14" opacity="0.8">Nexus Corp</text>
                <rect x="100" y="38" width="180" height="12" fill="currentColor" opacity="0.2" rx="6" />
                <rect x="100" y="38" width="150" height="12" fill="currentColor" opacity="0.6" rx="6" />
                <text x="290" y="50" fill="currentColor" fontSize="14" fontWeight="bold">85</text>
                
                {/* Vendor 3 */}
                <text x="0" y="80" fill="currentColor" fontSize="14" opacity="0.8">Alpha Inc.</text>
                <rect x="100" y="68" width="180" height="12" fill="currentColor" opacity="0.2" rx="6" />
                <rect x="100" y="68" width="120" height="12" fill="currentColor" opacity="0.4" rx="6" />
                <text x="290" y="80" fill="currentColor" fontSize="14" fontWeight="bold">68</text>
              </g>
            </g>

            {/* Bottom-Right Scatter/Matrix Node */}
            <g transform="translate(850, 420)">
              <text x="0" y="-15" fill="currentColor" fontSize="16" fontFamily="monospace" opacity="0.6">ANOMALY DETECTION</text>
              <g stroke="currentColor" strokeWidth="1" opacity="0.3">
                <line x1="0" y1="0" x2="250" y2="0" />
                <line x1="0" y1="30" x2="250" y2="30" />
                <line x1="0" y1="60" x2="250" y2="60" />
                <line x1="0" y1="90" x2="250" y2="90" />
                <line x1="0" y1="120" x2="250" y2="120" />
                <line x1="0" y1="0" x2="0" y2="120" />
                <line x1="50" y1="0" x2="50" y2="120" />
                <line x1="100" y1="0" x2="100" y2="120" />
                <line x1="150" y1="0" x2="150" y2="120" />
                <line x1="200" y1="0" x2="200" y2="120" />
                <line x1="250" y1="0" x2="250" y2="120" />
              </g>
              <g fill="currentColor" opacity="0.8">
                <circle cx="50" cy="90" r="4" className="animate-pulse" />
                <circle cx="100" cy="60" r="5" />
                <circle cx="150" cy="30" r="3" />
                <circle cx="200" cy="120" r="8" opacity="0.4" className="animate-pulse" />
                <circle cx="200" cy="120" r="3" />
                <text x="215" y="125" fontSize="12" fontWeight="bold" className="animate-pulse">RISK</text>
                <circle cx="250" cy="60" r="4" />
              </g>
              <path d="M50 90 L100 60 L150 30 L200 120 L250 60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="4 4" />
            </g>

            {/* Background watermark large text */}
            <g fill="currentColor" fontFamily="monospace" fontWeight="bold">
              <text x="40" y="60" fontSize="36" opacity="0.3">LIQUIDITY PREDICTION ENGINE</text>
              <text x="650" y="580" fontSize="36" opacity="0.3">AI VENDOR BEHAVIOR ANALYSIS</text>
            </g>
          </svg>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6 drop-shadow-md">
            Autonomous Liquidity Prediction & Behavioral Scoring
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            CashPredix is a machine learning-driven platform that anticipates your company's cash flows and analyzes vendor reliability to keep your finances secure and predictable.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Get started
            </Link>
            <a href="#features" className="rounded-md border border-gray-600 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32 bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-400">Deploy faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to manage cashflow
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                    📊
                  </div>
                  Cash Flow Prediction
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">Forecast future cash flow timelines automatically using advanced Time-Series ML models tailored to your historical data.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                    🤖
                  </div>
                  Vendor Behavioral Scoring
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">Analyze vendor payment histories to assign dynamic behavioral reliability scores, helping you assess risks instantly.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                    🏢
                  </div>
                  Seamless Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">Easily upload vendor data via Excel and manage all your companies from a centralized, real-time dashboard.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
