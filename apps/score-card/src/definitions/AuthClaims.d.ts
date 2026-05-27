export interface AuthClaims {
  scoutNumber: string;
  isAdmin: boolean;
  isVerify: boolean;
  verificationStatus?: 'verified-safe' | 'trained-participant' | 'assistant-guide' | 'guide' | 'assessor';
}
