import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./features/theme/store"; // aplica o tema salvo antes da primeira renderização
import "./features/acessibilidade/store"; // aplica as preferências de acessibilidade (issue #95)
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
