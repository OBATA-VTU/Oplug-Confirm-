export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  walletBalance: number;
  referralCode: string;
  package: 'User' | 'Reseller' | 'API';
}

export interface Transaction {
  id: string;
  type: 'Airtime' | 'Data' | 'Cable' | 'Electricity' | 'Transfer' | 'Funding';
  amount: number;
  status: 'Successful' | 'Pending' | 'Failed';
  date: string;
  details: string;
}

export interface ServicePlan {
  id: string;
  name: string;
  amount: number;
  type?: string;
}
