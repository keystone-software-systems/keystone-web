import { KeystoneIcon } from "./icon";
import { KeystoneWordmark } from "./wordmark";

type Props = {
  iconClassName?: string;
  wordmarkClassName?: string;
};

export function KeystoneLogo({ iconClassName = "h-8 w-auto", wordmarkClassName = "text-xl" }: Props) {
  return (
    <span className="flex items-center gap-2.5">
      <KeystoneIcon className={iconClassName} />
      <KeystoneWordmark className={wordmarkClassName} />
    </span>
  );
}
