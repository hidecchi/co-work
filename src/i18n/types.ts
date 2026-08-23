export type Lang = "ja" | "en";

export type HowToUseStep = {
  title: string;
  description: string;
  image: string;
};

export type Translations = {
  seo: {
    title: string;
    description: string;
    ogImageAlt: string;
    locale: string;
    ogLocale: string;
  };
  header: {
    mainNav: string;
    mobileNav: string;
    menuOpen: string;
    menuClose: string;
    navHowToUse: string;
    navInformation: string;
    navContact: string;
    langSwitch: string;
    langSwitchAria: string;
  };
  hero: {
    h1: string;
    bgText: string;
    entryFeePrefix: string;
    entryFeeSuffix: string;
    unlimited: string;
    imageAlt: string;
    openBadgeDate: string;
    openBadgeText: string;
  };
  about: {
    locationLink: string;
    locationSuffix: string;
    markerFee: string;
    opening: string;
    markerNoMembership: string;
    closing: string;
    featuresHeading: string;
    features: string[];
  };
  howToUse: {
    label: string;
    heading: string;
    steps: HowToUseStep[];
  };
  information: {
    label: string;
    heading: string;
    mapTitle: string;
    nameLabel: string;
    name: string;
    addressLabel: string;
    addressLine1: string;
    addressLine2: string;
    addressNote: string;
    hoursLabel: string;
    hours: string;
    seatsLabel: string;
    seats: string;
    mapCta: string;
  };
  contact: {
    title: string;
    description: string;
    heading: string;
    lead: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    companyLabel: string;
    messageLabel: string;
    required: string;
    submit: string;
  };
  footer: {
    navLabel: string;
    copyright: string;
  };
};
