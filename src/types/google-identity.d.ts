/** Google Identity Services (One Tap + Sign in with Google) */
declare namespace google.accounts.id {
  interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: "signin" | "signup" | "use";
    itp_support?: boolean;
  }

  interface CredentialResponse {
    credential: string;
    select_by?: string;
    clientId?: string;
  }

  interface PromptMomentNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => string;
    isSkippedMoment: () => boolean;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
    getMomentType: () => string;
  }

  function initialize(config: IdConfiguration): void;
  function prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
  function cancel(): void;
  function disableAutoSelect(): void;
}

declare namespace google.accounts {
  const id: typeof google.accounts.id;
}

interface Window {
  google?: typeof google;
}
