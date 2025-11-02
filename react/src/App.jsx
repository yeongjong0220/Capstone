import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import {AuthProvider} from '../contexts/AuthContext.jsx' 
import 'bootstrap/dist/css/bootstrap.min.css'

// 컴포넌트
import Header from '../components/Header'
import Login from '../page/Login'
import Register from '../page/Register'
import Home from '../page/Home'
import BoardView from '../page/BoardView.jsx'
import Board from '../page/Board.jsx'
import BoardWrite from '../page/BoardWrite.jsx'
import Temp from '../page/Temp.jsx'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter> {/* (2) 라우팅 기능 */}
        <AuthProvider> {/*(3) 인증 상태 */}
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/write" element={<BoardWrite />} />
            <Route path="/board/view/:postnum" element={<BoardView />} />
            <Route path="/temp" element={<Temp/>}></Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App