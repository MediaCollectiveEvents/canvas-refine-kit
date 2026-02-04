export interface NavItem {
  label: string;
  href: string;
}

export interface Settings {
  palette: {
    primary: string;
    secondary?: string;
    background?: string;
  };
  footer: {
    text?: string;
    showEventsInFooter?: boolean;
  };
  nav: NavItem[];
}
