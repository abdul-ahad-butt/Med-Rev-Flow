import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/auth/Login'
import { DashboardPage } from './pages/Dashboard'
import { ClaimsPage } from './pages/Claims'
import { ClaimDetailPage } from './pages/ClaimDetail'
import { DenialsPage } from './pages/Denials'
import { DenialDetailPage } from './pages/DenialDetail'
import { ARPage } from './pages/AR'
import { PriorAuthPage } from './pages/PriorAuth'
import { PatientsPage } from './pages/Patients'
import { PatientDetailPage } from './pages/PatientDetail'
import { AppointmentsPage } from './pages/Appointments'
import { ProvidersPage } from './pages/Providers'
import { InsurancePage } from './pages/Insurance'
import { TasksPage } from './pages/Tasks'
import { MessagesPage } from './pages/Messages'
import { MarketingPage } from './pages/Marketing'
import { LeadsPage } from './pages/Leads'
import { ReportsPage } from './pages/Reports'
import { SettingsPage } from './pages/Settings'
import { RevenueCyclePage } from './pages/RevenueCycle'
import { AuditPage } from './pages/Audit'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected App */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="revenue-cycle" element={<RevenueCyclePage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="claims/:id" element={<ClaimDetailPage />} />
        <Route path="denials" element={<DenialsPage />} />
        <Route path="denials/:id" element={<DenialDetailPage />} />
        <Route path="ar" element={<ARPage />} />
        <Route path="prior-authorizations" element={<PriorAuthPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="insurance" element={<InsurancePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
