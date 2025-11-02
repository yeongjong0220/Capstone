import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../style/headers.css'
import { useAuth } from '../contexts/AuthContext';
import Logo from '../src/assets/logo.png';

const Header = () => {

  const authContext = useAuth();
  const { logout } = authContext;

  const nav = useNavigate();

  return (
    <div className="container-fluid">
      <header
        className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom"
      >
        <div className="col-md-3 mb-2 mb-md-0">
          <a
            onClick={() => { nav('/') }}
            className="d-inline-flex link-body-emphasis text-decoration-none"
          >
            <img src={Logo} alt="React Logo" width="40" height="32" />
          </a>
        </div>
        <ul
          className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0"
        >
          <li><a href="/" className="nav-link px-2 link-secondary">홈</a></li>
          <li><a href="/board" className="nav-link px-2">게시판</a></li>
          <li><a href="#" className="nav-link px-2">Pricing</a></li>
          <li><a href="#" className="nav-link px-2">FAQs</a></li>
          <li><a href="#" className="nav-link px-2">About</a></li>
        </ul>
        {!(authContext.isLoggedIn) && (
          <div className="col-md-3 text-end">
            <button type="button" className="btn btn-outline-primary me-2" onClick={() => { nav('/login') }}>
              Login
            </button>
            <button type="button" className="btn btn-primary" onClick={() => { nav('/register') }}>Sign-up</button>
          </div>
        )}
        {
          (authContext.isLoggedIn) && (
            <div className="col-md-3 text-end">
              <span style={{
                marginRight: '12px',
                background: '#f0f4ff',
                padding: '4px 16px',
                borderRadius: '16px',
                fontWeight: 'bold',
                color: '#2d5be3',
                fontSize: '1rem',
                border: '1px solid #d0d8ee',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}>
                {authContext.name}님
              </span>
              <button type="button" className="btn btn-outline-primary me-2" onClick={() => { logout() }}>
                Log out
              </button>
            </div>
          )
        }
      </header>
    </div>
  )
}

export default Header