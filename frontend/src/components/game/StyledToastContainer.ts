import {ToastContainer} from "react-toastify";
import styled from "@emotion/styled";

export const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    text-align: center;
    width: 400px;
    max-width: 50rem;
    font-family: Sansation, sans-serif;
    font-size: 24px;
    filter: drop-shadow(1px 2px 3px black);
    background-color: #0e0e0e;
  }

  .Toastify__toast--warning {
    color: #ffde27;
    .Toastify__progress-bar {
      background-color: #ffde27;
    }
  }

  .Toastify__toast--success {
    color: #3fe577;
    .Toastify__progress-bar {
      background-color: #3fe577;
    }
  }

  .Toastify__toast--error {
    color: crimson;
    .Toastify__progress-bar {
      background-color: crimson;
    }
  }
`;
