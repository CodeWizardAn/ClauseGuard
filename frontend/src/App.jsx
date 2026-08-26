import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './auth'
import ProtectedRoute from './components/ProtectedRoute'
import AmbientBackground from './components/AmbientBackground'
import Auth from './pages/Auth'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import Vault from './pages/Vault'
import Analysis from './pages/Analysis'
import Report from './pages/Report'
import Glossary from './pages/Glossary'
import Comparison from './pages/Comparison'
import Personalize from './pages/Personalize'
import SmartContext from './pages/SmartContext'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/setup" element={<ProtectedRoute><PageWrapper><Setup /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute needSetup><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute needSetup><PageWrapper><Analyze /></PageWrapper></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute needSetup><PageWrapper><Vault /></PageWrapper></ProtectedRoute>} />
        <Route path="/smart-context/:contractId" element={<ProtectedRoute needSetup><PageWrapper><SmartContext /></PageWrapper></ProtectedRoute>} />
        <Route path="/personalize/:contractId" element={<ProtectedRoute needSetup><PageWrapper><Personalize /></PageWrapper></ProtectedRoute>} />
        <Route path="/analysis/:contractId" element={<ProtectedRoute needSetup><PageWrapper><Analysis /></PageWrapper></ProtectedRoute>} />
        <Route path="/report/:contractId" element={<ProtectedRoute needSetup><PageWrapper><Report /></PageWrapper></ProtectedRoute>} />
        <Route path="/glossary" element={<ProtectedRoute needSetup><PageWrapper><Glossary /></PageWrapper></ProtectedRoute>} />
        <Route path="/comparison" element={<ProtectedRoute needSetup><PageWrapper><Comparison /></PageWrapper></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Continuous Living Ambient Background */}
        <AmbientBackground />
        <div className="relative z-10">
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
