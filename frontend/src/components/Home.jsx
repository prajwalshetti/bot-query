import React from 'react';
import { useNavigate } from 'react-router-dom'; // For routing

function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white">
      
      <button
        onClick={()=>{navigate("/chessGame")}}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
      >
        Play Chess
      </button>
    </div>
  );
}

export default Home;
