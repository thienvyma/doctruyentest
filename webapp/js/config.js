/**
 * Configuration
 * - API_BASE_URL: main backend API (if available)
 * - STATIC_DATA_BASE: fallback static JSON location (for GitHub Pages)
 */

export const API_BASE_URL =
    window.API_BASE_URL ||
    `${window.location.protocol}//${window.location.host}/api`;

export const STATIC_DATA_BASE =
    window.STATIC_DATA_BASE || `${window.location.origin}/data`;

