/**
 * Central portfolio configuration for Bhanuprasad L.
 *
 * RESUME DOWNLOAD CONFIGURATION:
 * Paste your public Google Drive resume share link into `RESUME_CONFIG.googleDriveFileUrl` below
 * (for example: "https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing").
 * Any standard Google Drive `/file/d/<ID>/view` or `?id=<ID>` URL is automatically normalized
 * into a direct PDF download URL (`https://drive.google.com/uc?export=download&id=<ID>`).
 * When `googleDriveFileUrl` is empty, the button cleanly downloads the bundled verified PDF resume.
 */
export const RESUME_CONFIG = {
  googleDriveFileUrl: "",
  fallbackLocalPdfPath: "/assets/Bhanuprasad_L_Resume.pdf",
  downloadFileName: "Bhanuprasad_L_Resume.pdf",
};

/**
 * Resolves either the configured Google Drive direct-download URL or the bundled PDF resume.
 * Never invents placeholder third-party URLs.
 */
export function getResumeDownloadMeta(config = RESUME_CONFIG) {
  const raw = (config.googleDriveFileUrl || "").trim();
  if (!raw) {
    return {
      href: `${process.env.PUBLIC_URL || ""}${config.fallbackLocalPdfPath}`,
      isExternalDrive: false,
      fileName: config.downloadFileName,
    };
  }

  const fileMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const queryMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const driveId = fileMatch?.[1] || queryMatch?.[1];

  return {
    href: driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : raw,
    isExternalDrive: true,
    fileName: config.downloadFileName,
  };
}

/**
 * Direct contact links & form delivery configuration.
 *
 * CONTACT FORM DELIVERY (zero backend required):
 * To receive contact form messages directly in your inbox without opening the visitor's email client,
 * paste either:
 * - `formEndpoint`: a Formspree endpoint (e.g. "https://formspree.io/f/your_form_id"), OR
 * - `web3formsAccessKey`: a free Web3Forms access key (https://web3forms.com) bound to your email.
 * When both are empty, submitting prepares a pre-filled `mailto:` draft to `email`.
 */
export const CONTACT_CONFIG = {
  email: "bhanuprasad.0921@gmail.com",
  linkedinUrl: "https://linkedin.com/in/bhanurx100",
  githubUrl: "https://github.com/bhanurx100",
  formEndpoint: "",
  web3formsAccessKey: "",
};

/**
 * Portfolio analytics configuration.
 *
 * Paste your Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX") into `ga4MeasurementId`
 * to track live page views, resume views/downloads, and contact submissions in GA4.
 * Local browser session telemetry is always recorded in `localStorage` as a zero-config fallback.
 */
export const ANALYTICS_CONFIG = {
  ga4MeasurementId: "",
  enabled: true,
};
