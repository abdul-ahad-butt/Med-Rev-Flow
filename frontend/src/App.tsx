import { hasPermission, Permission, getDefaultRouteForRole } from './config/permissions';
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/auth/Login'
import ChangePassword from './pages/auth/ChangePassword'
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

// Route guard component
function RoleRoute({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasPermission(user.role, permission)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }
  return <>{children}</>;
}

function ProtectedRoute({ children, allowPasswordChange = false }: { children: React.ReactNode, allowPasswordChange?: boolean }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.mustChangePassword && !allowPasswordChange) return <Navigate to="/change-password" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user } = useAuthStore();
  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ProtectedRoute allowPasswordChange><ChangePassword /></ProtectedRoute>} />

      {/* Protected App */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<RootRedirect />} />
        <Route path="dashboard" element={<RoleRoute permission={Permission.VIEW_DASHBOARD}><DashboardPage /></RoleRoute>} />
        <Route path="revenue-cycle" element={<RoleRoute permission={Permission.VIEW_CLAIMS}><RevenueCyclePage /></RoleRoute>} />
        <Route path="claims" element={<RoleRoute permission={Permission.VIEW_CLAIMS}><ClaimsPage /></RoleRoute>} />
        <Route path="claims/:id" element={<RoleRoute permission={Permission.VIEW_CLAIMS}><ClaimDetailPage /></RoleRoute>} />
        <Route path="denials" element={<RoleRoute permission={Permission.VIEW_DENIALS}><DenialsPage /></RoleRoute>} />
        <Route path="denials/:id" element={<RoleRoute permission={Permission.VIEW_DENIALS}><DenialDetailPage /></RoleRoute>} />
        <Route path="ar" element={<RoleRoute permission={Permission.VIEW_AR}><ARPage /></RoleRoute>} />
        <Route path="prior-authorizations" element={<RoleRoute permission={Permission.VIEW_PATIENTS}><PriorAuthPage /></RoleRoute>} />
        <Route path="patients" element={<RoleRoute permission={Permission.VIEW_PATIENTS}><PatientsPage /></RoleRoute>} />
        <Route path="patients/:id" element={<RoleRoute permission={Permission.VIEW_PATIENTS}><PatientDetailPage /></RoleRoute>} />
        <Route path="appointments" element={<RoleRoute permission={Permission.VIEW_APPOINTMENTS}><AppointmentsPage /></RoleRoute>} />
        <Route path="providers" element={<RoleRoute permission={Permission.VIEW_PROVIDERS}><ProvidersPage /></RoleRoute>} />
        <Route path="insurance" element={<RoleRoute permission={Permission.VIEW_INSURANCE}><InsurancePage /></RoleRoute>} />
        <Route path="tasks" element={<RoleRoute permission={Permission.VIEW_TASKS}><TasksPage /></RoleRoute>} />
        <Route path="messages" element={<RoleRoute permission={Permission.VIEW_MESSAGES}><MessagesPage /></RoleRoute>} />
        <Route path="marketing" element={<RoleRoute permission={Permission.VIEW_MARKETING}><MarketingPage /></RoleRoute>} />
        <Route path="leads" element={<RoleRoute permission={Permission.VIEW_LEADS}><LeadsPage /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute permission={Permission.VIEW_REPORTS}><ReportsPage /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute permission={Permission.MANAGE_PRACTICE_SETTINGS}><SettingsPage /></RoleRoute>} />
        <Route path="audit" element={<RoleRoute permission={Permission.VIEW_AUDIT_LOG}><AuditPage /></RoleRoute>} />
      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
