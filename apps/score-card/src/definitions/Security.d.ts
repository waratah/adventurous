export class Security {
  uid: string;
  isAdmin?: boolean;
  isVerify?: boolean;
  verificationStatus?: 'verified-safe' | 'trained-participant' | 'assistant-guide' | 'guide' | 'assessor';
  scoutNumber: string;
}
