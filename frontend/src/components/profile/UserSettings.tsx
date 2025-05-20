import styled from "@emotion/styled";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import { FormEvent } from "react";
import { Stack } from "@mui/material";

export default function UserSettings() {
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
            <Stack alignItems={"flex-start"} gap={0.5}>
                <DescriptionSpan>Change Safety Question:</DescriptionSpan>
                <ChangeQuestionForm onSubmit={handleSubmit}>
                    <ChangeQuestionInput name="question" placeholder="question"></ChangeQuestionInput>
                    <ChangeQuestionInput name="answer" placeholder="answer"></ChangeQuestionInput>
                    <SaveChangesButton type="submit">💾</SaveChangesButton>
                </ChangeQuestionForm>
            </Stack>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    max-width: 1204px;
    gap: 20px;
    @media (max-width: 1100px) {
        justify-content: center;
    }
`;

const DescriptionSpan = styled.span`
    font-family: "Naston", sans-serif;
    font-size: 15px;
    color: #1d7dfc;
    @media (max-width: 500px) {
        font-size: 13px;
    }
`;

const ChangeQuestionForm = styled.form`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
`;

const ChangeQuestionInput = styled.input`
    width: 188px;
    height: 20px;
    border-radius: 5px;
    border: 1px solid #1d7dfc;
    font-family: Cousine, sans-serif;

    &:focus {
        outline: none;
        background-color: #646cff;
    }

    @media (max-width: 1050px) {
        width: 25vw;
    }
`;

const SaveChangesButton = styled.button`
    height: 25px;
    min-width: 30px;
    font-size: 15px;
    padding: 0;
    border: 1px solid #1d7dfc;

    &:hover {
        background-color: #646cff;
    }
`;
