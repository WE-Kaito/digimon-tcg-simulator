import styled from "@emotion/styled";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { FormEvent } from "react";
import { Button } from "../Button.tsx";

export default function SafetyQuestion() {
    const changeSafetyQuestion = useGeneralStates((state) => state.changeSafetyQuestion);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const question = formData.get("question") as string;
        const answer = formData.get("answer") as string;
        changeSafetyQuestion(question, answer);
        event.currentTarget.reset();
    }

    return (
        <Wrapper>
            <div style={{ gap: 8, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "Naston, sans-serif", color: "#1d7dfc" }}>Safety Question:</span>
                <ChangeQuestionForm onSubmit={handleSubmit}>
                    <StyledInput name="question" placeholder="question"></StyledInput>
                    <StyledInput name="answer" placeholder="answer"></StyledInput>
                    <Button type={"submit"}>SAVE</Button>
                </ChangeQuestionForm>
            </div>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    @media (max-width: 1100px) {
        justify-content: center;
    }
`;

const ChangeQuestionForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
`;

const StyledInput = styled.input`
    width: 243px;
    height: 32px;
    background: #242424;
    font-family: Cousine, sans-serif;

    &:focus {
        outline: 2px solid #1d7dfc;
        outline-offset: -2px;
    }
`;
