interface AppStoreState {
  welcome: string;
}

type Icon =
  | "cloud-rain"
  | "thermometer-hot"
  | "road-horizon"
  | "drop"
  | "fish"
  | "note-pencil";

type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

interface IconProps {
  id: Icon | string;
  className?: string;
  weight?: IconWeight;
  mirrored?: boolean;
}

export type { AppStoreState, IconProps };
