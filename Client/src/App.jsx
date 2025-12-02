import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// Simple Components for Testing
const Home = () => (
  <div style={styles.container}>
    <div style={styles.card}>
      <h1 style={styles.title}>Socket.io Chat App</h1>
      <p style={styles.subtitle}>Real-time messaging with Socket.io</p>
      <div style={styles.buttonContainer}>
        <Link to="/login" style={styles.primaryButton}>Login</Link>
        <Link to="/register" style={styles.secondaryButton}>Register</Link>
      </div>
      <p style={styles.testLink}>
        <Link to="/chat" style={styles.link}>Go to Chat (Test)</Link>
      </p>
    </div>
  </div>
);

const Login = () => (
  <div style={styles.container}>
    <div style={styles.card}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/chat'; }} style={styles.form}>
        <input type="email" placeholder="Email" style={styles.input} required />
        <input type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" style={styles.submitButton}>Sign In</button>
      </form>
      <p style={styles.linkContainer}>
        <Link to="/" style={styles.link}>← Back to Home</Link>
        <span style={{ margin: '0 10px' }}>•</span>
        <Link to="/register" style={styles.link}>Create Account</Link>
      </p>
    </div>
  </div>
);

const Register = () => (
  <div style={styles.container}>
    <div style={styles.card}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/chat'; }} style={styles.form}>
        <input type="text" placeholder="Username" style={styles.input} required />
        <input type="email" placeholder="Email" style={styles.input} required />
        <input type="password" placeholder="Password" style={styles.input} required />
        <input type="password" placeholder="Confirm Password" style={styles.input} required />
        <button type="submit" style={styles.submitButton}>Create Account</button>
      </form>
      <p style={styles.linkContainer}>
        <Link to="/" style={styles.link}>← Back to Home</Link>
        <span style={{ margin: '0 10px' }}>•</span>
        <Link to="/login" style={styles.link}>Already have account?</Link>
      </p>
    </div>
  </div>
);

const Chat = () => (
  <div style={{ minHeight: '100vh', display: 'flex' }}>
    <div style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
      <h3>Chat App</h3>
      <div style={{ marginTop: '20px' }}>
        <h4>Online Users</h4>
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <div style={{ width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%', marginRight: '10px' }}></div>
            <span>You</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <div style={{ width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%', marginRight: '10px' }}></div>
            <span>User 1</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '30px' }}>
        <h4>Rooms</h4>
        <button style={styles.roomButton}># General</button>
        <button style={{ ...styles.roomButton, background: '#34495e' }}># Random</button>
      </div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #eee' }}>
        <h3># General</h3>
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>User 1: </strong>
          <span>Welcome to the chat!</span>
          <small style={{ color: '#666', marginLeft: '10px' }}>10:00 AM</small>
        </div>
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <small style={{ color: '#666', marginRight: '10px' }}>10:01 AM</small>
          <strong>You: </strong>
          <span style={{ background: '#007bff', color: 'white', padding: '5px 10px', borderRadius: '10px', display: 'inline-block' }}>Hello everyone!</span>
        </div>
      </div>
      <div style={{ padding: '20px', borderTop: '1px solid #eee', background: 'white' }}>
        <form style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Type a message..." style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>Send</button>
        </form>
      </div>
    </div>
  </div>
);

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#666',
    fontSize: '14px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px'
  },
  primaryButton: {
    flex: 1,
    padding: '15px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '5px',
    fontWeight: '500',
    fontSize: '16px'
  },
  secondaryButton: {
    flex: 1,
    padding: '15px',
    background: '#764ba2',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '5px',
    fontWeight: '500',
    fontSize: '16px'
  },
  testLink: {
    textAlign: 'center',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  submitButton: {
    padding: '15px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  linkContainer: {
    textAlign: 'center',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    color: '#666',
    fontSize: '14px'
  },
  roomButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '5px 0',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left'
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;