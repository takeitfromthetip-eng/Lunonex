export const remixConfig = {
  remixAnchor: `remix-${navigator.platform || 'web'}-${navigator.userAgent || 'unknown'}`,
  timestamp: new Date().toISOString(),
  sovereignFlags: {
    overlaysEnabled: true,
    badgeMinting: true,
    protocolPropagation: true,
  },
  creatorId: 'jacob',
};
