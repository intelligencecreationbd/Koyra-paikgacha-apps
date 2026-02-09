
export enum SubmissionType {
  ADD = 'সংযোজন',
  EDIT = 'সংশোধন',
  DELETE = 'মুছে ফেলা'
}

export interface SubMenu {
  id: string;
  name: string;
  icon?: string;
  nestedSubMenus?: SubMenu[];
}

export interface HotlineContact {
  id: string;
  serviceType: string;
  name: string;
  address: string;
  mobile: string;
  centralHotline: string;
  photo?: string;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface LegalServiceContact {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  mobile: string;
  homeAddress?: string;
  officeAddress?: string;
  photo?: string;
  customFields?: CustomField[];
}

export interface BusCounter {
  id: string;
  route: string;
  busName: string;
  acFare: string;
  nonAcFare: string;
  counters: {
    name: string;
    mobile: string;
  }[];
}

export interface MainMenu {
  id: string;
  name: string;
  icon: string;
  subMenus: SubMenu[];
  color: string;
}

export interface Submission {
  id: string;
  timestamp: string;
  type: SubmissionType;
  mainMenu: string;
  subMenu: string;
  nestedSubMenu?: string;
  details: string[];
  status?: 'pending' | 'approved';
  identity: {
    isAnonymous: boolean;
    name?: string;
    mobile?: string;
    address?: string;
  };
}

export interface Notice {
  id: string;
  content: string;
  date: string;
}

export interface User {
  memberId: string;
  fullName: string;
  mobile: string;
  email?: string;
  dob: string;
  village: string;
  nid?: string;
  status?: 'active' | 'suspended';
}

export interface LedgerEntry {
  id: string;
  personName: string;
  mobile: string;
  address: string;
  type: 'pabo' | 'debo';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'pending';
  createdAt: string;
}
