import React from "react";
import Home from "./pages/Home";
import Pdp from "./pages/Pdp";
import {BrowserRouter, Route, Routes } from "react-router-dom";
const App = () => {
  return (
    <BrowserRouter>

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<Pdp />} />
    </Routes>

    </BrowserRouter>
  );
};

export default App;
