/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { createContext } from "react";

type CookieConsent = {
  isConsentRequired: boolean;
  manageConsent: () => void;
};

export const CookieConsentContext = createContext<CookieConsent | null>(null);
