import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider } from '../contexts/AuthContextEx'
import 'bootstrap/dist/css/bootstrap.min.css'
// import './App.css'

// 컴포넌트
import HeaderEx from '../components/HeaderEx'
import Header from '../components/Header'

import LoginEx from '../page/LoginEx'
import Login from '../page/Login'
import Register from '../page/Register'
import Home from '../page/Home'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>    {/* (2) 라우팅 기능 */}
        <AuthProvider>     {/*(3) 인증 상태 */}
        <Header />
          <Routes>
            <Route path = "/" element= {<Home />} />
            <Route path = "/loginEx" element={<LoginEx />} />
            <Route path = "/login" element={<Login />} />
            <Route path = "/register" element={<Register />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App