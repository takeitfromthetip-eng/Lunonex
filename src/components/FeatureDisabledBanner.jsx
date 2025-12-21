/* eslint-disable */
import React from 'react';
import './FeatureDisabledBanner.css';

/**
 * Banner shown when features are disabled pending API keys
 */
export default function FeatureDisabledBanner({ features }) {
  // ALL USERS GET FULL ACCESS - Never show disabled banner
  return null;
}

/**
 * Inline feature blocker for specific components
 */
export function FeatureBlocker({ feature, features, children }) {
  // ALL USERS GET FULL ACCESS - Feature locks disabled
  return children;
}
