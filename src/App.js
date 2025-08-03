import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Context
import { UserProvider } from "./context/UserContext";

// Components
import Header from "./components/common/Header";
import AppRoutes from "./routes/AppRoute";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <AppRoutes />
          </main>
          <ToastContainer
            position="top-right"
            autoClose={1500}
            limit={1}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
