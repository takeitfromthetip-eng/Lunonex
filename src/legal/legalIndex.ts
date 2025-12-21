export interface LegalDocument {
  id: string;
  title: string;
  path: string;
  version: string;
  lastUpdated: string;
  requiredAcceptance: boolean;
}

export const legalIndex: LegalDocument[] = [
  {
    id: "terms-of-service",
    title: "Terms of Service",
    path: "/legal/terms-of-service.md",
  version: "2.0.0",
    lastUpdated: "2025-10-11",
    requiredAcceptance: true,
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    path: "/legal/privacy-policy.md",
  version: "2.0.0",
    lastUpdated: "2025-10-11",
    requiredAcceptance: true,
  },
  // Additional valid LegalDocument objects can be added here
];

