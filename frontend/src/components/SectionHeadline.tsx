import styled from "@emotion/styled";

export default function SectionHeadline({
    headline,
    rightElement,
}: {
    headline: string;
    rightElement?: React.ReactNode;
}) {
    return (
        <Container>
            <div
                style={{
                    width: "100%",
                    height: "3.5em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span>{headline}</span>
                {rightElement}
            </div>
            <hr style={{ width: "100vw", maxWidth: 1204 }} />
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    width: 100vw;
    max-width: 1204px;

    span {
        color: #1d7dfc;
        line-height: 1;
        font-family: Naston, sans-serif;
        font-size: 26px;
        @media (max-width: 1050px) {
            padding-left: 5px;
        }
        transform: translateY(5px);
    }

    hr {
        color: #1d7dfc;
        width: 100%;
        background: #1d7dfc;
        height: 2px;
        border-radius: 3px;
        margin-top: 0;
    }
`;
