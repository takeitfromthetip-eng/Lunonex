// ...existing code...
/**
 * Snitching Clause Update
 *
 * Illegal content is automatically screened, banned, and reported to authorities by the platform's automated systems. Users should not report other creators to the platform for illegal content, as such material is already handled and removed by automation. All other moderation is minimal and focused on legal compliance and user safety.
 */
// ...existing code...
/**
 * Additional Legal Protections
 *
 * 6. Disclaimer of Liability: The platform is not liable for any damages resulting from user-generated content, misuse, or interruptions in service.
 * 7. Indemnification: Users agree to indemnify and hold harmless the platform and its owners against any claims arising from their actions or content.
 * 8. Right to Modify Terms: The platform reserves the right to update or modify these terms at any time. Continued use constitutes acceptance of changes.
 * 9. Jurisdiction and Governing Law: All disputes will be governed by the laws and jurisdiction specified by the platform.
 * 10. Privacy Policy: Users should review the platform's privacy policy to understand how data is handled and protected.
 * 11. Account Termination: The platform may terminate accounts for any violation of terms, at its sole discretion.
 * 12. No Guarantee of Service: The platform does not guarantee uninterrupted or error-free service.
 */
// ...existing code...
/**
 * Terms of Service - Illegal Content Policy
 *
 * 1. Any account flagged for uploading, sharing, or attempting to post illegal content (including but not limited to child exploitation, abuse, or other criminal material) will be immediately terminated and reported to the proper authorities. This process is fully automated.
 * 2. The platform is not responsible for user-generated content, but will cooperate fully with law enforcement agencies as required by law.
 * 3. Users are solely responsible for all content they upload, share, or post. By using this platform, users agree to comply with all applicable laws.
 * 4. The platform reserves the right to retain evidence of illegal activity as required by law, and such evidence will be securely stored and only accessible to law enforcement.
 * 5. The platform complies with all laws regarding reporting and handling of illegal content. Automated systems are in place to detect, report, and restrict access to such material.
 */
/**
 * Media Identification and Copyright Flagging
 *
 * All media uploaded or processed through Vanguard must be identified as original creator content or flagged if it could potentially violate copyright laws. If media is flagged, the creator will be notified and must review the content. By accepting flagged content, the creator acknowledges and accepts full responsibility for hosting and distributing the material. The platform provides tools for creators to revise, remove, or provide proof of ownership. This process helps prevent accidental copyright violations and shifts legal responsibility to the creator for any flagged content.
 */

/**
 * ANTI-PIRACY POLICY (Updated November 2025)
 * 
 * STRICTLY PROHIBITED CONTENT:
 * - Pirated anime episodes, series, or movies from any source
 * - Copyrighted TV shows, films, or streaming platform content
 * - Content distributed by unauthorized fansub groups (HorribleSubs, SubsPlease, Erai-raws, etc.)
 * - Complete seasons, episode batches, torrent files, or bulk distributions
 * - Any copyrighted content you do not own or have explicit legal rights to distribute
 * 
 * AUTOMATED DETECTION SYSTEM:
 * The platform employs automated anti-piracy detection that scans ALL uploads for:
 * 1. File names containing copyrighted series names (Naruto, One Piece, Attack on Titan, etc.)
 * 2. Piracy distribution patterns (S01E05 format, resolution tags, codec indicators)
 * 3. Fansub group watermarks and metadata
 * 4. File sizes matching typical pirated episode distributions
 * 5. User upload history and behavioral patterns
 * 
 * THREE-STRIKE ENFORCEMENT:
 * Strike 1: Immediate content blocking + formal warning
 * Strike 2: 7-day upload suspension + final warning + account review
 * Strike 3: Permanent upload ban + account termination consideration
 * (Strikes expire after 90 days of compliant behavior)
 * 
 * LEGAL CONSEQUENCES:
 * Uploading pirated content may result in:
 * - Immediate account termination without warning
 * - Reporting to copyright holders (Disney, Sony, Crunchyroll, etc.)
 * - Reporting to law enforcement agencies
 * - Civil lawsuits by copyright owners seeking damages
 * - Criminal prosecution under applicable copyright laws
 * - Financial liability for statutory damages ($750-$150,000 per work)
 * 
 * USER ACKNOWLEDGMENT:
 * By using ForTheWeebs, you explicitly acknowledge and agree that:
 * - You are SOLELY RESPONSIBLE for ensuring you have legal rights to all uploaded content
 * - The platform is NOT LIABLE for any copyright violations you commit
 * - We cooperate FULLY with DMCA takedown requests and law enforcement
 * - We maintain comprehensive audit logs for legal compliance and evidence
 * - Piracy attempts are logged and may be reported to authorities
 * - False claims of original ownership constitute fraud and may result in prosecution
 * 
 * TIMING CONTEXT (November 2025):
 * This policy is enforced during a global crackdown on piracy and unauthorized content distribution. 
 * Governments worldwide are actively shutting down piracy websites, torrent sites, and unauthorized 
 * streaming platforms. ForTheWeebs takes a zero-tolerance approach to protect both creators and the 
 * platform from legal liability. Only upload content you created or have explicit written permission 
 * to distribute.
 */

/**
 * User Content Policy and Liability
 *
 * Users are permitted to post any type of media content, subject to automated moderation. Illegal content is automatically detected, banned, and reported to authorities. All other content remains the sole responsibility of the user, including any copyright violations or attempts to monetize copyrighted material. By using the platform, users accept full liability for their actions and content. The platform does not censor lawful content but enforces strict automated removal of illegal material. Users must ensure they have the rights to share, distribute, or monetize any content they upload.
 */
/**
 * Account Termination and Copyright Complaints
 *
 * Accounts will only be terminated for posting illegal content, as required by law. No account will be taken down for copyright violations; instead, any copyright complaints or takedown requests will be directed to the creator who posted the content. The creator is responsible for removing infringing material or facing the legal consequences. The platform acts solely as a conduit and does not mediate copyright disputes. All responsibility for copyright compliance rests with the content creator.
 */
// ...existing code...

let acceptanceLog = [];

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      let body = req.body;
      // Vercel may parse body as string, so handle JSON
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: "Invalid JSON" });
        }
      }
      const { userId, ipAddress, version } = body || {};
      if (!userId || !ipAddress || !version) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      acceptanceLog.push({
        userId,
        timestamp: Date.now(),
        ipAddress,
        version,
      });
      return res.status(200).json({ success: true });
    }
    if (req.method === "GET") {
      let userId = req.query?.userId;
      if (!userId && req.query && typeof req.query.get === "function") {
        userId = req.query.get("userId");
      }
      if (!userId) {
        return res.status(400).json({ error: "Missing userId in query" });
      }
      const history = acceptanceLog.filter((entry) => entry.userId === userId);
      return res.status(200).json({ accepted: history.length > 0, history });
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("tos.js serverless error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
