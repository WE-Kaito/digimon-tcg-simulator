import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import Header from "../components/Header.tsx";
import PatchnotesAndDisclaimer from "../components/PatchnotesAndDisclaimer.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

enum INPUT_TYPE {
    USERNAME = "username",
    PASSWORD = "password",
    REPEATED_PASSWORD = "repeatedPassword",
    QUESTION = "question",
}

export default function LoginPage() {

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const login = useStore((state) => state.login);

    const [registerPage, setRegisterPage] = useState(false);

    const [userNameReg, setUserNameReg] = useState("");
    const [passwordReg, setPasswordReg] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const register = useStore((state) => state.register);
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{6,128}$/;
    const regexName = /^(?:(?![:_【】﹕≔<>$& ]).){3,16}$/;
    const regexQuestion = /^(?:(?![:_【】﹕≔<>$&]).){1,64}$/;

    function handleSubmitLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        login(userName, password, navigate);
    }

    function handleSubmitRegistration(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!regexName.test(userNameReg) || !regex.test(passwordReg) || passwordReg !== repeatedPassword
            || !regexQuestion.test(question) || !regexQuestion.test(answer)) return;

        register(userNameReg, passwordReg, question, answer, setRegisterPage, navigate);
        setPasswordReg("");
        setRepeatedPassword("");
        setUserNameReg("");
        setQuestion("");
        setAnswer("");
    }

    function getInputColor(input: string, type: INPUT_TYPE) {
        if (input === "") return "ghostwhite";

        let valid = false;
        switch (type) {
            case INPUT_TYPE.USERNAME:
                valid = regexName.test(input);
                break;
            case INPUT_TYPE.PASSWORD:
                valid = regex.test(input);
                break;
            case INPUT_TYPE.QUESTION:
                valid = regexQuestion.test(input);
                break;
            case INPUT_TYPE.REPEATED_PASSWORD:
                valid = repeatedPassword === passwordReg;
        }
        if (valid) return "#6ed298";
        else return "#e17b88";
    }

    return (
        <MenuBackgroundWrapper>
            <Header/>
            {!registerPage && <StyledForm onSubmit={handleSubmitLogin}>
                <InputField value={userName} onChange={(e) => setUserName(e.target.value)}
                            type="text" name="userName" placeholder="username" maxLength={16}/>
                <div>
                    <InputField value={password} onChange={(e) => setPassword(e.target.value)}
                                type="password" name="password" placeholder="password"/>
                    <br/>
                    <StyledInfo2 onClick={() => navigate("/recover-password")}>Forgot your password?</StyledInfo2>
                </div>
                <LoginPageButton type="submit"><ButtonSpan>LOGIN</ButtonSpan></LoginPageButton>
                <RegisterButton style={{marginTop: "50px"}} type="button"
                                onClick={() => setRegisterPage(true)}><ButtonSpan>REGISTER</ButtonSpan></RegisterButton>
            </StyledForm>
            }

            {registerPage &&
                <StyledForm2 onSubmit={handleSubmitRegistration}>
                    <div>
                        <InputFieldRegister value={userNameReg} onChange={(e) => setUserNameReg(e.target.value)}
                                            type="text" name="userName" placeholder="username" maxLength={16}
                                            style={{backgroundColor: `${getInputColor(userNameReg, INPUT_TYPE.USERNAME)}`}}
                        />
                        <br/>
                        <StyledInfo>3 - 16 characters</StyledInfo>
                    </div>
                    <div>
                        <InputFieldRegister value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)}
                                            type="password" name="password" placeholder="password"
                                            style={{backgroundColor: `${getInputColor(passwordReg, INPUT_TYPE.PASSWORD)}`}}
                        />
                        <br/>
                        <StyledInfo>
                            6+ characters, cont. numbers & letters
                        </StyledInfo>
                    </div>
                    <InputFieldRegister value={repeatedPassword} onChange={(e) => setRepeatedPassword(e.target.value)}
                                        type="password" name="RepeatPassword" placeholder="repeat password"
                                        style={{backgroundColor: `${getInputColor(repeatedPassword, INPUT_TYPE.REPEATED_PASSWORD)}`}}/>
                    <InputFieldRegister value={question} onChange={(e) => setQuestion(e.target.value)}
                                        type="text" name="Question" placeholder="safety question"
                                        style={{backgroundColor: `${getInputColor(question, INPUT_TYPE.QUESTION)}`}}/>
                    <InputFieldRegister value={answer} onChange={(e) => setAnswer(e.target.value)}
                                        type="text" name="Answer" placeholder="answer (pw recovery)"
                                        style={{backgroundColor: `${getInputColor(answer, INPUT_TYPE.QUESTION)}`}}/>
                    <ButtonContainer>
                        <BackButton type="button"
                                    onClick={() => setRegisterPage(false)}><ButtonSpan>BACK</ButtonSpan></BackButton>
                        <LoginPageButton type="submit"><ButtonSpan>REGISTER</ButtonSpan></LoginPageButton>
                    </ButtonContainer>
                </StyledForm2>
            }
            {!registerPage && <PatchnotesAndDisclaimer/>}
        </MenuBackgroundWrapper>
    );
}

export const LoginPageButton = styled.button`
  cursor: pointer;
  width: 160px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 0;
  background: #D9D9D9;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 20px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: lightgray;
    transform: translateY(1px);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #f8f8f8;
    transform: translateY(2px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;

export const InputField = styled.input`
  width: 280px;
  height: 60px;
  flex-shrink: 0;
  border: none;
  color: #070707;
  background: ghostwhite;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.25) inset;
  font-family: 'Naston', sans-serif;
  font-size: 26px;
  text-align: center;
  margin-bottom: 3px;
  transform: skewX(-15deg);

  :focus {
    outline: none;
  }

`;

export const InputFieldRegister = styled(InputField)`
  font-size: 22px;
  width: 300px;
  height: 50px;
`;

const StyledForm = styled.form`
  margin-top: 70px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  justify-content: center;
  @media (max-width: 767px) {
    gap: 20px;
  }
`;

const StyledForm2 = styled.form`
  margin-top: 45px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    gap: 20px;
    margin-top: 35px;
  }
`;

const StyledInfo = styled.span`
  font-family: 'Naston', sans-serif;
  font-size: 15px;
`;

const StyledInfo2 = styled.span`
  font-family: 'Naston', sans-serif;
  font-size: 14px;
  margin-top: 2px;
  color: #646cff;
  user-select: none;
  cursor: pointer;

  &:hover {
    color: #ff880d;
  }

  &:active {
    color: #ff310d;
  }
`;

const RegisterButton = styled(LoginPageButton)`
  background-color: black;
  color: ghostwhite;
  border-right: 1px solid rgba(25, 25, 26, 0.55);
  border-bottom: 1px solid rgba(25, 25, 26, 0.55);

  &:hover {
    background: #061025;
  }

  &:active {
    background: #08183a;
  }
`;

const BackButton = styled(RegisterButton)`
  width: 110px;
  margin-right: 45px;
`;

const ButtonSpan = styled.span`
  font-family: 'Pixel Digivolve', sans-serif;
  letter-spacing: 1px;
`;

const ButtonContainer = styled.div`
  margin-top: 50px;
  @media (max-width: 767px) {
    margin-top: 32px;
  }
`;
