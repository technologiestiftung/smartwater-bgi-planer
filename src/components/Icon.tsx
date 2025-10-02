"use client";
import { IconProps } from "@/types/app";
import {
  CloudRainIcon as CloudRain,
  ThermometerHotIcon as ThermometerHot,
  RoadHorizonIcon as RoadHorizon,
  DropIcon as Drop,
  FishIcon as Fish,
  NotePencilIcon as NotePencil,
} from "@phosphor-icons/react";
import { FC } from "react";

const Icon: FC<IconProps> = ({ id, className, weight = "regular" }) => {
  const iconProps = {
    weight,
    className,
  };
  if (id === "cloud-rain") return <CloudRain {...iconProps} />;
  if (id === "thermometer-hot") return <ThermometerHot {...iconProps} />;
  if (id === "road-horizon") return <RoadHorizon {...iconProps} />;
  if (id === "drop") return <Drop {...iconProps} />;
  if (id === "fish") return <Fish {...iconProps} />;
  if (id === "note-pencil") return <NotePencil {...iconProps} />;
  return <p className="text-red">No Icon was found: {id}</p>;
};

export default Icon;
