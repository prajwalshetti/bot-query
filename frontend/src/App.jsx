import { useState } from 'react'
import './App.css'
import {BrowserRouter,Route, Routes} from "react-router-dom"; 
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Adminpage from "./components/Adminpage.jsx";
import About from "./components/About";
function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="register/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminpage" element={<Adminpage />} />
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App