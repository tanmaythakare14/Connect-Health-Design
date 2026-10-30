import type { JSX } from 'react';
import { BookOpenText, KeyRound } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { SetupAnswer, SetupChoiceProps } from '../../../@types';

/**
 * "Yes, I have it" / "Not yet" radio cards used by every setup screen
 * (Epic app, Open Dental keys…). Nothing is selected until the user picks.
 */
export function SetupChoice({
  value,
  onChange,
  ariaLabel,
  yesDescription,
  notYetDescription,
  disabled = false,
}: SetupChoiceProps): JSX.Element {
  const options: Array<{
    value: SetupAnswer;
    title: string;
    description: string;
    icon: typeof KeyRound;
  }> = [
    {
      value: 'yes',
      title: 'Yes, I have it',
      description: yesDescription,
      icon: KeyRound,
    },
    {
      value: 'not_yet',
      title: 'Not yet',
      description: notYetDescription,
      icon: BookOpenText,
    },
  ];

  return (
    <RadioGroup
      value={value ?? ''}
      onValueChange={(next) => {
        if (next === 'yes' || next === 'not_yet') {
          onChange(next);
        }
      }}
      aria-label={ariaLabel}
      disabled={disabled}
      className="grid gap-3 sm:grid-cols-2"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        const radioId = `setup-choice-${option.value}`;
        return (
          <label
            key={option.value}
            htmlFor={radioId}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150',
              'hover:border-primary/40 hover:bg-accent/40 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/30',
              isSelected &&
                'border-primary bg-accent shadow-sm hover:bg-accent',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                {option.title}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {option.description}
              </span>
            </span>
            <RadioGroupItem
              id={radioId}
              value={option.value}
              className="mt-0.5"
            />
          </label>
        );
      })}
    </RadioGroup>
  );
}
