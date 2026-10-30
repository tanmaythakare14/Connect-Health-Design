import { useState, type JSX } from 'react';
import { ChevronDown, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog, CopyTextBlock } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  AdvancedKeySettingsProps,
  SigningAlgorithm,
  SigningKeyType,
} from '../../../../@types';
import {
  SIGNING_ALGORITHMS_BY_KEY_TYPE,
  SIGNING_KEY_TYPE_OPTIONS,
} from '../../../../constants';
import {
  apiDtoToSigningKeyPair,
  generateSigningKeyPair,
} from '../../../../service';
import { isSigningKeyType } from '../../../../utils';

const PANEL_ID = 'backend-advanced-key-settings';
const KEY_TYPE_ID = 'backend-key-type';
const ALGORITHM_ID = 'backend-key-algorithm';
const PRIVATE_KEY_ID = 'backend-private-key';
const PUBLIC_JWKS_ID = 'backend-public-jwks';

/**
 * Key type, algorithm and key-pair rotation for a backend connection.
 * ConnectHealth generates the pair; replacing it is confirmed first because
 * the EHR keeps trusting the old key until its cache expires.
 */
export function AdvancedKeySettings({
  connectionId,
  signingKeys,
  onKeysGenerated,
  disabled = false,
}: AdvancedKeySettingsProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [keyType, setKeyType] = useState<SigningKeyType>(signingKeys.keyType);
  const [algorithm, setAlgorithm] = useState<SigningAlgorithm>(
    signingKeys.algorithm,
  );
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const algorithms = SIGNING_ALGORITHMS_BY_KEY_TYPE[keyType];

  // An algorithm only fits one key type, so switching type picks its default.
  const handleKeyTypeChange = (value: string): void => {
    if (!isSigningKeyType(value)) return;
    setKeyType(value);
    setAlgorithm(SIGNING_ALGORITHMS_BY_KEY_TYPE[value][0]);
  };

  const handleGenerate = async (): Promise<void> => {
    const dto = await generateSigningKeyPair(connectionId, {
      keyType,
      algorithm,
    });
    onKeysGenerated(apiDtoToSigningKeyPair(dto));
    setIsPrivateKeyVisible(false);
    toast.success('New key pair generated', {
      description: `${keyType} · ${algorithm}. Run the connection test again once Oracle Health picks up the new key.`,
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={PANEL_ID}
          className="-ml-2 text-primary hover:bg-accent hover:text-primary"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
          Advanced key settings
        </Button>
        <p className="text-xs text-muted-foreground">
          We generated a signing key pair for this connection. Change it only if
          your EHR needs a different key type or you bring your own key.
        </p>
      </div>

      {isOpen && (
        <div
          id={PANEL_ID}
          className="space-y-6 rounded-lg border bg-muted/40 p-5 animate-in fade-in-0 slide-in-from-top-1 duration-200"
        >
          {/* Key type + algorithm, then rotate */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={KEY_TYPE_ID}>Key type</Label>
                <Select
                  value={keyType}
                  onValueChange={handleKeyTypeChange}
                  disabled={disabled}
                >
                  <SelectTrigger id={KEY_TYPE_ID} className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNING_KEY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={ALGORITHM_ID}>Algorithm</Label>
                <Select
                  value={algorithm}
                  onValueChange={(value) => {
                    const match = algorithms.find((item) => item === value);
                    if (match) setAlgorithm(match);
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger id={ALGORITHM_ID} className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {algorithms.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={disabled}
              >
                <RefreshCw aria-hidden />
                Generate new key pair
              </Button>
              <p className="text-xs text-muted-foreground">
                The JWKS URL stays the same, but the EHR may cache the old key
                for a while — validate again after changing keys.
              </p>
            </div>
          </div>

          {/* Private key — masked until revealed, never copyable */}
          <div className="space-y-2">
            <Label htmlFor={PRIVATE_KEY_ID}>Private key (PEM format)</Label>
            <div className="relative">
              <Textarea
                id={PRIVATE_KEY_ID}
                value={signingKeys.privateKeyPem}
                readOnly
                aria-readonly
                aria-hidden={!isPrivateKeyVisible}
                tabIndex={isPrivateKeyVisible ? 0 : -1}
                className={cn(
                  'h-28 cursor-not-allowed resize-none break-all border-input bg-muted pr-11 font-mono text-xs leading-relaxed text-muted-foreground shadow-none md:text-xs',
                  'focus-visible:border-input focus-visible:ring-0',
                  !isPrivateKeyVisible &&
                    'pointer-events-none overflow-hidden blur-sm select-none',
                )}
              />
              {!isPrivateKeyVisible && (
                <span className="sr-only">Private key hidden</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsPrivateKeyVisible((visible) => !visible)}
                aria-pressed={isPrivateKeyVisible}
                aria-label={
                  isPrivateKeyVisible ? 'Hide private key' : 'Show private key'
                }
                className="absolute top-1.5 right-1.5 size-8 text-muted-foreground"
              >
                {isPrivateKeyVisible ? (
                  <EyeOff aria-hidden />
                ) : (
                  <Eye aria-hidden />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The private key is encrypted and stored securely — it never leaves
              ConnectHealth.
            </p>
          </div>

          {/* Public JWKS */}
          <div className="space-y-2">
            <Label htmlFor={PUBLIC_JWKS_ID}>
              JWKS (JSON Web Key Set) — public key
            </Label>
            <CopyTextBlock
              id={PUBLIC_JWKS_ID}
              value={signingKeys.publicJwks}
              label="Public JWKS"
            />
            <p className="text-xs text-muted-foreground">
              This public JWKS is hosted at the JWKS URL above for your EHR to
              validate tokens.
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Generate a new key pair?"
        description={`This replaces the current key with a new ${keyType} · ${algorithm} pair. Oracle Health may keep using the cached old key for a while, so test the connection again afterwards.`}
        confirmLabel="Generate key pair"
        pendingLabel="Generating…"
        onConfirm={handleGenerate}
        errorMessage="We couldn’t generate a new key pair. Please try again."
      />
    </div>
  );
}
