import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import "./index.css";
import App from "./App.tsx";
import ApiErrorNotification from "./components/ApiErrorNotification.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HeroUIProvider>
            <ToastProvider placement="top-right" toastOffset={20} />
            <ApiErrorNotification />
            <App />
        </HeroUIProvider>
    </StrictMode>,
);
