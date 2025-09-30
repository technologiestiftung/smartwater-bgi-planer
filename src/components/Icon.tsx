"use client";
import colors from "@/lib/colors/colors";
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

const Icon: FC<IconProps> = ({
  id,
  size = 56,
  color = "primary",
  weight = "regular",
  mirrored = false,
}) => {
  const resolvedColor = colors[color] ?? color;
  if (id === "cloud-rain")
    return (
      <CloudRain
        size={size}
        color={resolvedColor}
        weight={weight}
        mirrored={mirrored}
      />
    );
  if (id === "thermometer-hot")
    return (
      <ThermometerHot
        size={size}
        color={resolvedColor}
        weight={weight}
        mirrored={mirrored}
      />
    );
  if (id === "road-horizon")
    return (
      <RoadHorizon
        size={size}
        color={resolvedColor}
        weight={weight}
        mirrored={mirrored}
      />
    );
  if (id === "drop")
    return (
      <Drop
        size={size}
        color={resolvedColor}
        weight={weight}
        mirrored={mirrored}
      />
    );
  if (id === "fish")
    return (
      <Fish
        size={size}
        color={resolvedColor}
        weight={weight}
        mirrored={mirrored}
      />
    );
  if (id === "note-pencil")
    return (
      <NotePencil
        size={size}
        color={resolvedColor}
        weight={weight}
        mirrored={mirrored}
      />
    );
  return <p className="text-red">No Icon was found: {id}</p>;
};

export default Icon;
