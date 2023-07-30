import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import Header from "../components/Header.tsx";


export default function LoginPage() {

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const login = useStore((state) => state.login);

    const [registerPage, setRegisterPage] = useState(false);

    const [userNameReg, setUserNameReg] = useState("");
    const [passwordReg, setPasswordReg] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const register = useStore((state) => state.register);
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/;

    function handleSubmitLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        login(userName, password, navigate);
    }

    function handleSubmitRegistration(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        register(userNameReg, passwordReg, repeatedPassword, setPassword, setRepeatedPassword, setRegisterPage);
    }

    return (
        <>
            <Header/>
            {!registerPage && <StyledForm onSubmit={handleSubmitLogin}>
                <InputField value={userName} onChange={(e) => setUserName(e.target.value)} type="text" name="userName"
                            placeholder="username"/>

                <InputField value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password"
                            placeholder="password"/>

                <LoginPageButton type="submit">LOGIN</LoginPageButton>
                <LoginPageButton style={{marginTop: "50px"}} type="button"
                                 onClick={() => setRegisterPage(true)}>REGISTER</LoginPageButton>
            </StyledForm>}
            {registerPage && <StyledForm2 onSubmit={handleSubmitRegistration}>

                <div>
                    <InputField value={userNameReg} onChange={(e) => setUserNameReg(e.target.value)} type="text" name="userName" placeholder="username"
                                style={{backgroundColor: userName.length >= 5 ? "lightgreen" : "tomato"}}/>
                    <br/>
                    <StyledSpan>at least 5 characters</StyledSpan>
                </div>
                <div>
                    <InputField value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)} type="password" name="password" placeholder="password"
                                style={{backgroundColor: regex.test(passwordReg) ? "lightgreen" : "tomato"}}
                    />
                    <br/>
                    <StyledSpan>
                        at least 6 characters,
                        <br/>
                        must contain numbers and letters
                    </StyledSpan>
                </div>
                <InputField value={repeatedPassword} onChange={(e) => setRepeatedPassword(e.target.value)} type="password" name="RepeatPassword" placeholder="repeat password"
                            style={{backgroundColor: passwordReg===repeatedPassword?"lightgreen":"tomato"}}/>
                <div>
                    <StyledLoginPageButton type="button" onClick={() => setRegisterPage(false)}>BACK</StyledLoginPageButton>
                    <LoginPageButton type="submit">REGISTER</LoginPageButton>
                </div>

            </StyledForm2>}
        </>
    );
}

export const LoginPageButton = styled.button`
  cursor: pointer;
  width: 130px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 5px;
  border: 1px solid #000;
  background: #D9D9D9;
  box-shadow: 2px 4px 2px 0 rgba(0, 0, 0, 0.25);
  font-family: Sansation, sans-serif;
  font-size: 20px;

  &:hover {
    background: lightgray;
  }
`;

export const InputField = styled.input`
  width: 240px;
  height: 51px;
  flex-shrink: 0;
  border-radius: 5px;
  border: 1px solid #000;
  background: #D9D9D9;
  box-shadow: 2px 2px 3px 0px rgba(0, 0, 0, 0.25) inset;
  font-family: Sansation, sans-serif;
  font-size: 20px;
  text-align: center;

`;

const StyledForm = styled.form`
  margin-top: 70px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  justify-content: center;
`;

const StyledForm2 = styled.form`
  margin-top: 70px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  justify-content: center;
`;

const StyledSpan = styled.span`
font-family: var(--font1);
`;

const StyledLoginPageButton = styled(LoginPageButton)`
width: 90px;
  margin-right: 22px;
  background-color: darkgrey;
`;