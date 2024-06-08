import styled from "@emotion/styled";
import {useStore} from "../../hooks/useStore.ts";
import {FormEvent, useMemo, useState} from "react";
import {MuiColorInput} from "mui-color-input";
import ResetIcon from '@mui/icons-material/SettingsBackupRestore';
import {IconButton, Stack} from "@mui/material";

export default function UserSettings() {

    const changeSafetyQuestion = useStore((state) => state.changeSafetyQuestion);

    const getStoredValue = (key: string, defaultValue: string) => {
        const storedValue = localStorage.getItem(key);
        return storedValue ?? defaultValue;
    };

    const [value1, setValue1] = useState(getStoredValue('color1', '#214d44'));
    const [value2, setValue2] = useState(getStoredValue('color2', '#0b3d65'));
    const [value3, setValue3] = useState(getStoredValue('color3', '#522170'));

    const handleChange = useMemo(() => (newValue: string, setValue: React.Dispatch<React.SetStateAction<string>>, storageKey: string) => {
        setValue(newValue);
        localStorage.setItem(storageKey, newValue);
    }, []);

    const handleChange1 = (newValue: string) => handleChange(newValue, setValue1, 'color1');
    const handleChange2 = (newValue: string) => handleChange(newValue, setValue2, 'color2');
    const handleChange3 = (newValue: string) => handleChange(newValue, setValue3, 'color3');

    function resetColors() {
        localStorage.removeItem('color1');
        localStorage.removeItem('color2');
        localStorage.removeItem('color3');
        setValue1('#214d44');
        setValue2('#0b3d65');
        setValue3('#522170');
    }

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

            <Stack direction={"row"} gap={1}  flexWrap={"wrap"} justifyContent={"center"}>
                <Stack alignItems={"flex-start"} gap={0.5}>
                    <DescriptionSpan>Set Background Color Scheme:</DescriptionSpan>
                    <Stack direction={"row"} gap={1}>
                        <MuiColorInputStyled value={value1} onChange={handleChange1} format={"hex"}/>
                        <MuiColorInputStyled value={value2} onChange={handleChange2} format={"hex"}/>
                        <MuiColorInputStyled value={value3} onChange={handleChange3} format={"hex"}/>
                    </Stack>
                </Stack>
                <Stack alignItems={"flex-start"} gap={0.5}>
                    <DescriptionSpan style={{transform: "translateX(50px)"}}>Preview:</DescriptionSpan>
                    <Stack direction={"row"} gap={1}>
                        <IconButton color="primary" sx={{ transform: "translateY(-9px)"}} onClick={resetColors}>
                            <ResetIcon />
                        </IconButton>
                        <PreviewHr color1={value1} color2={value2} color3={value3}/>
                    </Stack>
                </Stack>
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

const PreviewHr = styled.hr<{color1: string, color2: string, color3: string}>`
  background: linear-gradient(253deg, ${({color3}) => color3} 0%, ${({color2}) => color2} 33%, ${({color2}) => color2} 67%, ${({color1}) => color1} 100%);
  height: 24px;
  width: 200px;
  margin: 0;
  border-radius: 5px;
  -webkit-animation: Background 5s ease infinite;
  -moz-animation: Background 5s ease infinite;
  animation: Background 5s ease infinite;
  background-size: 200% 200%;
  @-webkit-keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }

  @-moz-keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }

  @keyframes Background {
    0% {
      background-position: 0 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0 50%
    }
  }
`;

const MuiColorInputStyled = styled(MuiColorInput)`
  & .MuiOutlinedInput-root {
    height: 32px;
    width: 120px;
    border: 1px solid #1d7dfc !important;
    color: ghostwhite !important;
    padding: 4px;
    transform: translateY(-3px);
  }
`

const DescriptionSpan = styled.span`
  font-family: 'Naston', sans-serif;
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
