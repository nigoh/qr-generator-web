export interface VCardData {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  url: string;
  address: string;
  note: string;
}

export const VCARD_INITIAL: VCardData = {
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  company: '',
  title: '',
  phone: '',
  email: '',
  url: '',
  address: '',
  note: '',
};
