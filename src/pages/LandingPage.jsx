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
        <div className="flex flex-1 justify-end gap-x-4">
          <Link to="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-400">
            Log in
          </Link>
          <Link to="/signup" className="text-sm font-semibold leading-6 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition-colors">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Autonomous Liquidity Prediction & Behavioral Scoring
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            CashPredix is a machine learning-driven platform that anticipates your company's cash flows and analyzes vendor reliability to keep your finances secure and predictable.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get started
            </Link>
            <a href="#features" className="text-sm font-semibold leading-6 text-white hover:text-gray-300">
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
