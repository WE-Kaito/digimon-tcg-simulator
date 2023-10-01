import {toast} from "react-toastify";
export const notifySuccess = () => toast.success('Deck saved!', {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
});

export const notifyLength = () => toast.error('Only full decks can be saved!', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
});

export const notifyName = () => toast.error('Please enter a name.', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
});

export const notifyUpdate = () => toast.success('Deck updated!', {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
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

export const notifyDelete = () => toast.success('Deck deleted!', {
    position: "top-center",
    autoClose: 200,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
});

export const notifyAlreadyExists = () => toast.error("Username already exists!", {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
});

export const notifyRegistered = () => toast.success('Registered!', {
    position: "bottom-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
});

export const notifySecurityView = () => toast.warning('Opponent opened Security Stack!', {
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    pauseOnHover: false,
});

export const notifyRequestedRestart = () => toast.success('Sent restart request!', {
    position: "bottom-center",
    autoClose: 1200,
    hideProgressBar: false,
    pauseOnHover: false,
});

export const notifyNoActiveDeck = () => toast.error('Please activate a deck first!', {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    pauseOnHover: false,
});

export const notifyCredentials = () => toast.error('Wrong username or password!', {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    pauseOnHover: false
});

export const notifyInvalidImport = () => toast.error('Deck not allowed!', {
    position: "top-left",
    autoClose: 2000,
    hideProgressBar: false,
    pauseOnHover: false
});
