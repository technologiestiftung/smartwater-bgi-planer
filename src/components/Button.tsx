"use client";
import { ButtonProps } from "@/types/app";
import { FC } from "react";
import Icon from "./Icon";

const Button: FC<ButtonProps> = ({
  text,
  type = "primary",
  onClick,
  disabled,
  iconID = "note-pencil",
}) => {
  const isDisabled = !onClick || disabled;
  const getStyling = () => {
    if (type === "primary") {
      if (isDisabled) return "cursor-not-allowed bg-mid-darker";
      return "cursor-pointer bg-primary hover:bg-secondary";
    }
    if (isDisabled)
      return "cursor-not-allowed bg-lighter border-2 border-mid-darker";
    return "cursor-pointer bg-white hover:bg-light border-2 border-primary";
  };
  return (
    <div className="flex-none flex-shrink-0 w-auto">
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        className={`flex gap-4 items-center py-2 px-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors ${getStyling()}`}
      >
        <Icon
          id={iconID}
          size={24}
          color={
            type === "primary" ? "white" : isDisabled ? "mid-darker" : "primary"
          }
        />
        <p
          className={
            type === "primary"
              ? "text-white"
              : isDisabled
              ? "text-mid-darker"
              : "text-primary"
          }
        >
          {text}
        </p>
      </button>
    </div>
  );
};

export default Button;
