import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ListVenuePage from './pages/ListVenuePage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/list-venue" element={<ListVenuePage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
