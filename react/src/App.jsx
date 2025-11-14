import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import {AuthProvider} from '../contexts/AuthContext.jsx' 
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// 컴포넌트
import Layout from '../components/Layout.jsx'
import Login from '../page/Login'
import Register from '../page/Register'
import Home from '../page/Home'
import BoardView from '../page/BoardView.jsx'
import Board from '../page/Board.jsx'
import BoardWrite from '../page/BoardWrite.jsx'
import About from '../page/About.jsx'
import Subscription from '../page/Subscription.jsx'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter> {/* (2) 라우팅 기능 */}
        <AuthProvider> {/*(3) 인증 상태 */}
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/board" element={<Board />} />
              <Route path="/board/write" element={<BoardWrite />} />
              <Route path="/board/view/:postnum" element={<BoardView />} />
              <Route path="/about" element={<About />} />
              <Route path="/subscription" element={<Subscription />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App