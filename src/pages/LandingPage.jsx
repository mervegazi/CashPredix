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
        <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden opacity-[0.05] pointer-events-none animate-float-delayed" aria-hidden="true">
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
            <path d="M0 500 Q 150 450 300 480 T 600 350 T 900 200 T 1200 100 L 1200 600 L 0 600 Z" fill="url(#chart-gradient)" opacity="0.4" />
            <path d="M0 500 Q 150 450 300 480 T 600 350 T 900 200 T 1200 100" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="300" cy="480" r="6" fill="currentColor" />
            <circle cx="600" cy="350" r="6" fill="currentColor" />
            <circle cx="900" cy="200" r="6" fill="currentColor" />
            <g fill="currentColor" stroke="currentColor" strokeWidth="2" opacity="0.8">
              <line x1="100" y1="400" x2="100" y2="480" /><rect x="94" y="420" width="12" height="40" />
              <line x1="200" y1="460" x2="200" y2="520" /><rect x="194" y="470" width="12" height="25" />
              <line x1="450" y1="360" x2="450" y2="440" /><rect x="444" y="380" width="12" height="35" />
              <line x1="750" y1="220" x2="750" y2="300" /><rect x="744" y="240" width="12" height="45" />
              <line x1="1050" y1="100" x2="1050" y2="180" /><rect x="1044" y="110" width="12" height="30" />
            </g>
            <g fill="currentColor" fontFamily="monospace" fontSize="22" fontWeight="bold" opacity="0.9">
              <text x="250" y="450">$45,230</text><text x="250" y="475" fontSize="16" opacity="0.7">+1.2%</text>
              <text x="550" y="310">$89,400</text><text x="550" y="335" fontSize="16" opacity="0.7">+5.8%</text>
              <text x="850" y="160">$124,800</text><text x="850" y="185" fontSize="16" opacity="0.7">+12.4%</text>
              <text x="1080" y="80">$156,000</text><text x="1080" y="105" fontSize="16" opacity="0.7">+8.1%</text>
              <text x="40" y="80" fontSize="36" opacity="0.3">LIQUIDITY PREDICTION</text>
              <text x="800" y="550" fontSize="36" opacity="0.3">VENDOR SCORE: 98/100</text>
              <text x="400" y="550" fontSize="24" opacity="0.3">Q4 CASHFLOW FORECAST</text>
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
