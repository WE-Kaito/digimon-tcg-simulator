import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Headline2} from "../components/Header.tsx";
import {InputField, InputFieldRegister, LoginPageButton} from "./LoginPage.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export default function RecoveryPage() {

    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{6,128}$/;

    const usernameForRecovery = useStore((state) => state.usernameForRecovery);
    const recoveryQuestion = useStore((state) => state.recoveryQuestion);
    const getRecoveryQuestion = useStore((state) => state.getRecoveryQuestion);
    const recoverPassword = useStore((state) => state.recoverPassword);

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeated, setNewPasswordRepeated] = useState("");
    const [answer, setAnswer] = useState("");

    function passwordColor() {
        if (newPassword === "") {
            return "ghostwhite";
        }
        if (regex.test(newPassword)) {
            return "#6ed298";
        } else {
            return "#e17b88";
        }
    }

    function repeatedPasswordColor() {
        if (newPasswordRepeated === "") {
            return "ghostwhite";
        }
        if (newPasswordRepeated === newPassword) {
            return "#6ed298";
        } else {
            return "#e17b88";
        }
    }

    function handleUserSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        getRecoveryQuestion(username);
    }

    function handleSubmitNewPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!regex.test(newPassword) || newPassword !== newPasswordRepeated) return;
        recoverPassword(answer, newPassword, navigate);
    }

    return (
        <MenuBackgroundWrapper>
            <Headline2 style={{marginTop: 80}}>Password Recovery</Headline2>

            <StyledForm onSubmit={handleUserSearch}>
                <InputField value={username} onChange={(e) => setUsername(e.target.value)} type="text" name="username"
                            placeholder={usernameForRecovery || "username"} maxLength={16}/>
                <ButtonContainer>
                    <BackButton type="button" onClick={() => navigate("/")}>
                        <ButtonSpan>Back</ButtonSpan>
                    </BackButton>
                    <LoginPageButton type="submit">
                        <ButtonSpan>Find</ButtonSpan>
                    </LoginPageButton>
                </ButtonContainer>
            </StyledForm>

            {(recoveryQuestion === "User not found!") && <StyledInfo2>User not found!</StyledInfo2>}

            {(recoveryQuestion !== "") && (recoveryQuestion !== "User not found!") &&

                <StyledForm2 onSubmit={handleSubmitNewPassword}>
                    <StyledInfo>{recoveryQuestion}</StyledInfo>
                    <InputFieldRegister value={answer} onChange={(e) => setAnswer(e.target.value)}
                                        type="text" name="answer" placeholder="answer"
                    />
                    <InputFieldRegister value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        type="password" name="password" placeholder="new password"
                                        style={{backgroundColor: passwordColor()}}
                    />
                    <InputFieldRegister value={newPasswordRepeated}
                                        onChange={(e) => setNewPasswordRepeated(e.target.value)}
                                        type="password" name="repeatPassword" placeholder="repeat new password"
                                        style={{backgroundColor: repeatedPasswordColor()}}
                    />
                    <ChangePWButton type="submit" style={{width: 280}}>
                        <ButtonSpan>Change Password</ButtonSpan>
                    </ChangePWButton>
                </StyledForm2>
            }
        </MenuBackgroundWrapper>
    );
}

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
  font-size: 16px;
  color: #646cff;
`;

const StyledInfo2 = styled.span`
  font-family: 'Naston', sans-serif;
  color: crimson;
  margin-top: 30px;
  font-size: 22px;
  max-width: 300px;
`;

const ChangePWButton = styled(LoginPageButton)`
  &:hover {
    background: #39dcb6;
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
