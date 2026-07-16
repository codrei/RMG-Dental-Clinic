import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'

// Booking and admin carry the Firebase SDK — lazy-loaded so the public
// pages ship a small bundle and Firebase only downloads when needed.
const Book = lazy(() => import('./pages/Book').then((m) => ({ default: m.Book })))
const Admin = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.Admin })))

function RouteFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Admin area stands on its own — no public nav/footer */}
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Suspense>
  )
}

export default App
