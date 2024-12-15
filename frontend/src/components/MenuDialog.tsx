import {Dialog, DialogProps} from "@mui/material";

export default function MenuDialog(props: DialogProps) {
    return (
        <Dialog sx={{background: "rgba(18,35,66,0.6)"}}
                PaperProps={{sx: {background: "rgb(12,12,12)"}}}
                maxWidth={"xl"}
                {...props}
        />
    );
}
