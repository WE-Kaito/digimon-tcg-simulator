import {ToastContainer} from "react-toastify";
import styled from "@emotion/styled";


export const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    text-align: center;
    width: 400px;
    max-width: 50rem;
    font-family: Sansation, sans-serif;
    font-size: 24px;
  }

  .Toastify__toast--warning {
    background-color: #0e0e0e;
    color: #ffde27;
    filter: drop-shadow(1px 2px 3px black);

    .Toastify__progress-bar {
      background-color: #ffde27;
    }
  }
  
`;
