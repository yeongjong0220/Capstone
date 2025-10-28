import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import {AuthProvider} from '../contexts/AuthContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
// import './App.css'

// 컴포넌트
import HeaderEx from '../components/HeaderEx'
import Header from '../components/Header'

import LoginEx from '../page/LoginEx'
import Login from '../page/Login'
import Register from '../page/Register'
import Home from '../page/Home'
import Board from '../page/Board.jsx'
import BoardWrite from '../page/BoardWrite.jsx'
import BoardView from '../page/BoardView.jsx'
import Chat from '../page/Chat.jsx' //새로 추가한 Chat 페이지 연결


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter> {/* (2) 라우팅 기능 */}
        <AuthProvider> {/*(3) 인증 상태 */}
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loginEx" element={<LoginEx />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/write" element={<BoardWrite />} />
            <Route path="/boardView" element={<BoardView />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App