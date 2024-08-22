import {PropsWithChildren} from "react";
import styled from "@emotion/styled";
export default function MenuBackgroundWrapper({children}: PropsWithChildren) {

    return (
        <StyledDiv>
            {children}
        </StyledDiv>
    );
}

const StyledDiv = styled.div`
  display: flex;
  min-height: 100vh;
  min-width: 100vw;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-x: clip;
  container-type: inline-size;
  container-name: wrapper;
  position: relative;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  .profile {
    padding-top: 20px;
    justify-content: flex-start;
  }
`;
