import styled from "@emotion/styled";
import {useStore} from "../../hooks/useStore.ts";
import {FormEvent} from "react";


export default function UserSettings() {

    const changeSafetyQuestion = useStore((state) => state.changeSafetyQuestion);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const question = formData.get("question") as string;
        const answer = formData.get("answer") as string;
        changeSafetyQuestion(question, answer);
        event.currentTarget.reset();
    }

    return (
        <Container>
            <Description>Change Safety Question:</Description>
            <ChangeQuestionForm onSubmit={handleSubmit}>
                <ChangeQuestionInput name="question" placeholder="question"></ChangeQuestionInput>
                <ChangeQuestionInput name="answer" placeholder="answer"></ChangeQuestionInput>
                <SaveChangesButton type="submit">💾</SaveChangesButton>
            </ChangeQuestionForm>
        </Container>
    );
}

const Container = styled.div`
  width: 1040px;
  height: 125px;
  position: absolute;
  top: 105px;

  display: flex;
  gap: 5px;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: 1050px) {
    width: 100%;
    top: 73px;
  }
`;

const Description = styled.span`
  font-family: 'Naston', sans-serif;
  font-size: 15px;
  color: #1d7dfc;
  @media (max-width: 1050px) {
    font-size: 13px;
    transform: translate(15px, 5px);
  }
`;

const ChangeQuestionForm = styled.form`
  display: flex;
  gap: 8px;
  flex-direction: row;
  align-items: flex-start;
  width: 195px;
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
