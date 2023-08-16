import {toast} from "react-toastify";
export const notifySuccess = () => toast('✔️ Deck saved!', {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
});

export const notifyLength = () => toast.error('Only full decks can be saved!', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
});

export const notifyName = () => toast.error('Please enter a name.', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
});

export const notifyUpdate = () => toast('✔️ Deck updated!', {
    position: "top-right",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
});

export const notifyError = () => toast.error('Could not update.', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
});

export const notifyDelete = () => toast('✔️ Deck deleted!', {
    position: "top-right",
    autoClose: 200,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
});

export const notifyAlreadyExists = () => toast.error("Username already exists!", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
});

export const notifyRegistered = () => toast('✔️ Registered!', {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
});

export const notifySecurityView = () => toast.warning('Opponent opened Security Stack!', {
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    pauseOnHover: false,
});

export const notifyRequestedRestart = () => toast.success('Sent restart request!', {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: false,
    pauseOnHover: false,
});