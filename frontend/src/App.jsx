import { useState } from "react";
import "./App.css";
import { BrowserRouter as  Router , Routes , Route} from "react-router-dom";
import { LandingPage } from "./pages/LandingPage.jsx";
import Authencation from "./pages/Authencation.jsx";
import {AuthProvider} from "./contexts/Authcontext.jsx";
import VideoComponet from "./contexts/VideoComponet.jsx";
import HomeComponent from "./pages/HomeComponent.jsx";


function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/"  element={ < LandingPage />}/>
            <Route path="/auth"  element={ < Authencation />}/>
            <Route path="/:path" element = {<VideoComponet />}/>
            <Route path="/home" element = {<HomeComponent />}/>
          </Routes>
          </AuthProvider>
      </Router>
    </>
  );
}

export default App;
