import { toast, ToastOptions } from "react-toastify";

const defaultConfig: ToastOptions = {
    position: "top-center",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: false,
};

export const notifySuccess = (message: string) => toast.success(message, { ...defaultConfig, autoClose: 1750 });

export const notifyInfo = (message: string) => toast.info(message, { ...defaultConfig, autoClose: 3000 });

export const notifyWarning = (message: string) => toast.warning(message, defaultConfig);

export const notifyError = (message: string) => toast.error(message, defaultConfig);
