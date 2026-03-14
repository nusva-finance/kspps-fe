import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/auth/Login'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Users from './pages/users/Users'
import UserForm from './pages/users/UserForm'
import Members from './pages/members/Members'
import MemberForm from './pages/members/MemberForm'
import Savings from './pages/savings/Savings'
import SavingsNew from './pages/savings/SavingsNew'
import SavingsForm from './pages/savings/SavingsForm'
import Security from './pages/security/Security'
import Margins from './pages/margins/Margins'
import MarginForm from './pages/margins/MarginForm'
import KategoriBarang from './pages/kategori-barang/KategoriBarang'
import KategoriBarangForm from './pages/kategori-barang/KategoriBarangForm'
import Rekening from './pages/rekening/Rekening'
import RekeningForm from './pages/rekening/RekeningForm'
import Pembiayaan from './pages/pembiayaan/Pembiayaan'
import PembiayaanForm from './pages/pembiayaan/PembiayaanForm'

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Users */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/add" element={<UserForm />} />
          <Route path="/users/:id/edit" element={<UserForm />} />

          {/* Members */}
          <Route path="/members" element={<Members />} />
          <Route path="/members/add" element={<MemberForm />} />
          <Route path="/members/:id/edit" element={<MemberForm />} />

          {/* Savings */}
          <Route path="/savings" element={<Savings />} />
          <Route path="/savings/new" element={<SavingsNew />} />
          <Route path="/savings/transaction/new" element={<SavingsForm />} />
          <Route path="/savings/pokok" element={<Savings />} />
          <Route path="/savings/wajib" element={<Savings />} />
          <Route path="/savings/modal" element={<Savings />} />

          {/* Pembiayaan */}
          <Route path="/pembiayaan" element={<Pembiayaan />} />
          <Route path="/pembiayaan/add" element={<PembiayaanForm />} />
          <Route path="/pembiayaan/:id/edit" element={<PembiayaanForm />} />

          {/* Security */}
          <Route path="/security" element={<Security />} />
          <Route path="/security/roles" element={<Security />} />
          <Route path="/security/audit-logs" element={<Security />} />

          {/* Setup / Margin / Pinjaman */}
          <Route path="/margins" element={<Margins />} />
          <Route path="/margins/add" element={<MarginForm />} />
          <Route path="/margins/:id/edit" element={<MarginForm />} />

          {/* Setup / Kategori Barang */}
          <Route path="/kategori-barang" element={<KategoriBarang />} />
          <Route path="/kategori-barang/add" element={<KategoriBarangForm />} />
          <Route path="/kategori-barang/:id/edit" element={<KategoriBarangForm />} />
          <Route path="/rekening" element={<Rekening />} />
          <Route path="/rekening/add" element={<RekeningForm />} />
          <Route path="/rekening/:id/edit" element={<RekeningForm />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App