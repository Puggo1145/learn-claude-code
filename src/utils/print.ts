import { type InspectColor, styleText } from "node:util";

type PrintTypeConfig = {
    color: InspectColor;
}

const printType: Record<string, PrintTypeConfig> = {
    message: {
        color: "reset",
    },
    tool: {
        color: "gray",
    },
    default: {
        color: "reset",
    },
}

export function print(
    text: string, 
    type: keyof typeof printType = "default"
) {
    console.log(styleText(printType[type]!.color, text));
}