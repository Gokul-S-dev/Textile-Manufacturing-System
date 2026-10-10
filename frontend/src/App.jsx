import { BrowserRouter, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-2xl bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl">
            🏭
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Textile Manufacturing System
        </h1>
        <p className="text-lg leading-8 text-gray-600 mb-8">
          Frontend structure initialized with React Router, Zustand, Axios, and Tailwind CSS v4.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <button className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
            View Dashboard
          </button>
          <button className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 transition-colors">
            Documentation <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
