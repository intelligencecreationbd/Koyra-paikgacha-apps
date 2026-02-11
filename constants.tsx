
import React from 'react';
import { 
  ShieldAlert, 
  Stethoscope, 
  Bus, 
  Scale, 
  GraduationCap, 
  Wrench, 
  ShoppingBag, 
  Users, 
  History, 
  CloudSun, 
  Info, 
  LogIn,
  NotebookTabs,
  Phone,
  Newspaper,
  HeartPulse,
  Truck,
  Building,
  UserCheck,
  MessagesSquare
} from 'lucide-react';
import { MainMenu } from './types';

/**
 * FINALIZED ORDER: Locked/Finished Public Modules First
 */
export const CATEGORIES: MainMenu[] = [
  {
    id: '1',
    name: 'হটলাইন',
    icon: 'ShieldAlert',
    color: '#FF4D4D',
    subMenus: []
  },
  {
    id: '3',
    name: 'যাতায়াত',
    icon: 'Bus',
    color: '#E67E22',
    subMenus: [
      { 
        id: '3-1', 
        name: 'বাস কাউন্টার',
        nestedSubMenus: [
          { id: '3-1-1', name: 'পাইকগাছা-ঢাকা' },
          { id: '3-1-2', name: 'পাইকগাছা-খুলনা' }
        ]
      }
    ]
  },
  {
    id: '16',
    name: 'কেপি চ্যাট',
    icon: 'MessagesSquare',
    color: '#0EA5E9',
    subMenus: []
  },
  {
    id: '10',
    name: 'আবহাওয়া',
    icon: 'CloudSun',
    color: '#00BCD4',
    subMenus: [
      { id: '10-1', name: 'আবহাওয়ার সংবাদ' }
    ]
  },
  {
    id: '4',
    name: 'আইনি সেবা',
    icon: 'Scale',
    color: '#2980B9',
    subMenus: [
      { id: '4-1', name: 'আইনজীবী' },
      { id: '4-2', name: 'সার্ভেয়ার' }
    ]
  },
  {
    id: '9',
    name: 'ঐতিহ্য',
    icon: 'History',
    color: '#A0522D',
    subMenus: [
      { 
        id: '9-1', 
        name: 'ইতিহাস',
        nestedSubMenus: [
          { id: '9-1-1', name: 'কয়রা উপজেলার ইতিহাস' },
          { id: '9-1-2', name: 'পাইকগাছা উপজেলার ইতিহাস' }
        ]
      },
      { 
        id: '9-2', 
        name: 'দর্শনীয় স্থান',
        nestedSubMenus: [
          { id: '9-2-1', name: 'কয়রা উপজেলার দর্শনীয় স্থান' },
          { id: '9-2-2', name: 'পাইকগাছা উপজেলার দর্শনীয় স্থান' }
        ]
      }
    ]
  },
  {
    id: '13',
    name: 'ডিজিটাল খাতা',
    icon: 'NotebookTabs',
    color: '#0056b3',
    subMenus: []
  },
  {
    id: '15',
    name: 'মোবাইল নাম্বার',
    icon: 'Phone',
    color: '#673AB7',
    subMenus: [
      { id: '15-1', name: 'ডাক্তার', icon: 'Stethoscope' },
      { id: '15-2', name: 'হাসপাল', icon: 'HeartPulse' },
      { id: '15-3', name: 'অ্যাম্বুলেন্স', icon: 'Truck' },
      { id: '15-4', name: 'সেচ্ছাসেবী রক্তদাতা', icon: 'Users' },
      { id: '15-5', name: 'ব্যাংক ও বীমা', icon: 'Building' },
      { id: '15-6', name: 'জনপ্রতিনিধি', icon: 'UserCheck' }
    ]
  },
  {
    id: '14',
    name: 'স্থানীয় সংবাদ',
    icon: 'Newspaper',
    color: '#4CAF50',
    subMenus: [
      { id: '14-1', name: 'কয়রা সংবাদ' },
      { id: '14-2', name: 'পাইকগাছা সংবাদ' }
    ]
  },
  {
    id: '7',
    name: 'অনলাইন হাট',
    icon: 'ShoppingBag',
    color: '#F1C40F',
    subMenus: []
  },
  {
    id: '12',
    name: 'ইউজার লগইন',
    icon: 'LogIn',
    color: '#3F51B5',
    subMenus: []
  }
];

export const ICON_MAP: Record<string, any> = {
  ShieldAlert,
  Stethoscope,
  Bus,
  Scale,
  GraduationCap,
  Wrench,
  ShoppingBag,
  Users,
  History,
  CloudSun,
  Info,
  LogIn,
  NotebookTabs,
  Phone,
  Newspaper,
  HeartPulse,
  Truck,
  Building,
  UserCheck,
  MessagesSquare
};
