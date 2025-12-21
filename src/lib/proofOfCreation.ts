/**
 * Proof of Creation - Blockchain-backed authorship verification
 * Creates cryptographic proof of creation timestamp and ownership
 */

import CryptoJS from 'crypto-js';

export interface CreationProof {
  artifactId: string;
  creatorId: string;
  contentHash: string;
  timestamp: number;
  blockchainTx?: string;
  signature: string;
  metadata: {
    filename?: string;
    filesize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };
  };
}

export interface OwnershipCertificate {
  proof: CreationProof;
  certificateId: string;
  issuedAt: number;
  verificationUrl: string;
  qrCode?: string;
}

class ProofOfCreationEngine {
  private proofs: Map<string, CreationProof> = new Map();
  private readonly SECRET_KEY = process.env.POC_SECRET_KEY || 'fortheweebs-sovereign-proof';

  /**
   * Generate cryptographic proof of creation
   */
  async generateProof(
    artifactId: string,
    creatorId: string,
    content: Blob | File | ArrayBuffer,
    metadata?: Partial<CreationProof['metadata']>
  ): Promise<CreationProof> {
    // Generate content hash
    const contentHash = await this.hashContent(content);
    
    // Create proof object
    const proof: CreationProof = {
      artifactId,
      creatorId,
      contentHash,
      timestamp: Date.now(),
      signature: '',
      metadata: {
        filename: metadata?.filename,
        filesize: content instanceof Blob ? content.size : undefined,
        mimeType: content instanceof Blob ? content.type : undefined,
        dimensions: metadata?.dimensions,
      },
    };

    // Generate cryptographic signature
    proof.signature = this.signProof(proof);

    // Store proof locally
    this.proofs.set(artifactId, proof);

    // Optional: Submit to blockchain for additional verification
    // proof.blockchainTx = await this.submitToBlockchain(proof);

    console.log('✅ Proof of Creation generated:', {
      artifactId,
      contentHash: contentHash.substring(0, 16) + '...',
      timestamp: new Date(proof.timestamp).toISOString(),
    });

    return proof;
  }

  /**
   * Verify a creation proof
   */
  verifyProof(proof: CreationProof): { valid: boolean; reason?: string } {
    // Verify signature
    const expectedSignature = this.signProof({
      ...proof,
      signature: '', // Exclude signature from signing
    });

    if (proof.signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' };
    }

    // Verify timestamp is not in future
    if (proof.timestamp > Date.now()) {
      return { valid: false, reason: 'Timestamp is in the future' };
    }

    // Additional checks could include blockchain verification
    return { valid: true };
  }

  /**
   * Generate ownership certificate
   */
  async generateCertificate(artifactId: string): Promise<OwnershipCertificate> {
    const proof = this.proofs.get(artifactId);
    if (!proof) {
      throw new Error('No proof found for artifact');
    }

    const certificateId = CryptoJS.SHA256(
      `${proof.artifactId}-${proof.creatorId}-${proof.timestamp}`
    ).toString();

    const verificationUrl = `https://fortheweebs.com/verify/${certificateId}`;

    const certificate: OwnershipCertificate = {
      proof,
      certificateId,
      issuedAt: Date.now(),
      verificationUrl,
      // QR code would be generated client-side
    };

    return certificate;
  }

  /**
   * Check if content has been re-uploaded elsewhere
   */
  async detectReupload(contentHash: string): Promise<{
    found: boolean;
    originalCreator?: string;
    originalTimestamp?: number;
    locations?: string[];
  }> {
    // Check local proofs first
    for (const [, proof] of this.proofs) {
      if (proof.contentHash === contentHash) {
        return {
          found: true,
          originalCreator: proof.creatorId,
          originalTimestamp: proof.timestamp,
        };
      }
    }

    // Optional: Check external databases/blockchain
    // This would integrate with DMCA detection systems

    return { found: false };
  }

  /**
   * Generate DMCA takedown request
   */
  async generateDMCARequest(
    originalArtifactId: string,
    infringingUrl: string
  ): Promise<{
    requestId: string;
    proof: CreationProof;
    takedownLetter: string;
  }> {
    const proof = this.proofs.get(originalArtifactId);
    if (!proof) {
      throw new Error('No proof found for artifact');
    }

    const requestId = CryptoJS.SHA256(
      `dmca-${originalArtifactId}-${infringingUrl}-${Date.now()}`
    ).toString();

    const takedownLetter = this.generateTakedownLetter(proof, infringingUrl);

    return {
      requestId,
      proof,
      takedownLetter,
    };
  }

  /**
   * Export proof for legal/archival purposes
   */
  exportProof(artifactId: string): string {
    const proof = this.proofs.get(artifactId);
    if (!proof) throw new Error('Proof not found');

    return JSON.stringify(
      {
        ...proof,
        exported: new Date().toISOString(),
        verificationInstructions: 'Use verifyProof() to validate this proof',
      },
      null,
      2
    );
  }

  /**
   * Import proof from backup
   */
  importProof(proofJson: string): void {
    const proof: CreationProof = JSON.parse(proofJson);
    
    // Verify imported proof
    const verification = this.verifyProof(proof);
    if (!verification.valid) {
      throw new Error(`Invalid proof: ${verification.reason}`);
    }

    this.proofs.set(proof.artifactId, proof);
  }

  /**
   * Get all proofs for a creator
   */
  getCreatorProofs(creatorId: string): CreationProof[] {
    return Array.from(this.proofs.values()).filter(
      p => p.creatorId === creatorId
    );
  }

  // Private helper methods

  private async hashContent(content: Blob | File | ArrayBuffer): Promise<string> {
    let buffer: ArrayBuffer;

    if (content instanceof Blob || content instanceof File) {
      buffer = await content.arrayBuffer();
    } else {
      buffer = content;
    }

    // Convert ArrayBuffer to WordArray
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer) as any);
    
    // Generate SHA-256 hash
    return CryptoJS.SHA256(wordArray).toString();
  }

  private signProof(proof: Partial<CreationProof>): string {
    const dataToSign = JSON.stringify({
      artifactId: proof.artifactId,
      creatorId: proof.creatorId,
      contentHash: proof.contentHash,
      timestamp: proof.timestamp,
    });

    return CryptoJS.HmacSHA256(dataToSign, this.SECRET_KEY).toString();
  }

  private generateTakedownLetter(proof: CreationProof, infringingUrl: string): string {
    return `
DMCA TAKEDOWN NOTICE

Date: ${new Date().toLocaleDateString()}

To Whom It May Concern:

I am the copyright owner (or authorized to act on behalf of the owner) of the work described below. This letter is official notification under Section 512(c) of the Digital Millennium Copyright Act (DMCA).

ORIGINAL WORK INFORMATION:
- Content Hash: ${proof.contentHash}
- Creation Date: ${new Date(proof.timestamp).toISOString()}
- Creator ID: ${proof.creatorId}
- Artifact ID: ${proof.artifactId}
- Cryptographic Signature: ${proof.signature}

INFRINGING MATERIAL:
- URL: ${infringingUrl}

PROOF OF OWNERSHIP:
This work is protected by cryptographic proof of creation, generated at the time of upload to ForTheWeebs platform. The proof includes:
1. SHA-256 hash of original content
2. Timestamp of creation
3. Cryptographic signature verifying ownership

VERIFICATION:
This proof can be independently verified at:
https://fortheweebs.com/verify/${proof.artifactId}

I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner.

Please remove or disable access to the infringing material immediately.

Signed,
${proof.creatorId}
ForTheWeebs Platform
    `.trim();
  }
}

export const proofOfCreation = new ProofOfCreationEngine();
