import ProfileDeck, {ProfileDeckProps} from "./ProfileDeck.tsx";
import {useSortable} from "@dnd-kit/sortable";
import styled from "@emotion/styled";
import {CSS as DNDCSS, Transform} from "@dnd-kit/utilities";

export default function SortableProfileDeck(props: Omit<ProfileDeckProps, "isDragging">) {

    const {attributes, listeners, setNodeRef, transform, transition, isDragging}
        = useSortable({id: props.deck.id});

    return (
        <SortableItemContainer ref={setNodeRef} {...attributes} isDragging={isDragging}
                               transition={transition} transform={transform}>
            <HandleDiv {...listeners} isDragging={isDragging}>:::</HandleDiv>
            <ProfileDeck isDragging={isDragging}  {...props} />
        </SortableItemContainer>
    );
}

type DragStyleProps = { isDragging: boolean, transition: string | undefined, transform: Transform | null };

const SortableItemContainer = styled.div<DragStyleProps>`
  transform: ${({transform}) => DNDCSS.Transform.toString(transform)};
  transition: ${({transition}) => transition};
  z-index: ${({isDragging}) => isDragging ? 1000 : 1};
  box-shadow: ${({isDragging}) => isDragging ? "0 0 8px 0 rgba(160, 160, 160, 0.3)" : "none"};
  border-radius: 12px;
  position: relative;
  cursor: ${({isDragging}) => isDragging ? "grabbing" : "unset"};
`;

const HandleDiv = styled.div<{ isDragging: boolean }>`
  position: absolute;
  z-index: 2;
  width: 34px;
  height: 20px;
  border-radius: 8px;
  background: linear-gradient(60deg, rgba(20, 20, 20, 0.3), rgba(30, 30, 30, 0.2));
  letter-spacing: 2px;
  font-family: 'League Spartan', sans-serif;
  color: lightgray;
  top: 2px;
  right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  scale: ${({isDragging}) => isDragging ? 0.7 : 1};

  &:hover {
    cursor: ${({isDragging}) => isDragging ? "grabbing" : "grab"};
    opacity: 0.8;
    background: linear-gradient(60deg, rgba(30, 30, 30, 0.5), rgba(60, 60, 60, 0.6));
  }
`;
