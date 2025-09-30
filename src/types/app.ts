import { MouseEventHandler } from "react";

type Icon =
  | "cloud-rain"
  | "thermometer-hot"
  | "road-horizon"
  | "drop"
  | "fish"
  | "note-pencil";

type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

interface AppStoreState {
  welcome: string;
}

interface IconProps {
  id: Icon | string;
  size?: number | string;
  color?: string;
  weight?: IconWeight;
  mirrored?: boolean;
}

interface ButtonProps {
  text: string;
  type?: "primary" | "secondary";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  iconID?: Icon | string;
}

export type { AppStoreState, IconProps, ButtonProps };
