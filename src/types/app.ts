import { MouseEventHandler } from "react";

type PhosphorIcon =
  | "cloud-rain"
  | "thermometer-hot"
  | "road-horizon"
  | "drop"
  | "fish"
  | "note-pencil";

type PhosphorIconWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";

interface AppStoreState {
  welcome: string;
}

interface PhosphorIconProps {
  id: PhosphorIcon | string;
  size?: number | string;
  color?: string;
  weight?: PhosphorIconWeight;
  mirrored?: boolean;
}

interface ButtonProps {
  text: string;
  type?: "primary" | "secondary";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  iconID?: PhosphorIcon | string;
}

export type { AppStoreState, PhosphorIconProps, ButtonProps };
