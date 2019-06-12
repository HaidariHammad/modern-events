declare interface IModernEventsWebPartStrings {
  DescriptionFieldLabel: string;
  PropertyPaneDescription: string;DescriptionFieldLabel: string;
  //Configure Texts and Labels
  LabelConfigIconName:string;
  LabelConfigIconText:string;
  LabelConfigIconName:string;
  LabelConfigIconDescription:string;
  LabelConfigBtnLabel:string;
  // SiteGroups
  SiteGroupName: string;
  CommandbarGroupName:string;
  DisplayGroupName:string;
  // Labels
  LabelViewButtons:string;
  LabelTimeformat:string;
  LabelSite:string;
  LabelSiteOther:string;
  LabelListTitle:string;
  LabelSite:string;
  LabelCommandbar:string;
  LabelViewMonth:string;
  LabelViewWeek:string;
  LabelViewList:string;
  //Commandbar Labels
  LabelButtonNew:string;
  LabelButtonNewEvent:string;
  LabelButtonMonth:string;
  LabelButtonTime:string;
  LabelButtonList:string;
  //EventPanel Labels
  LabelEventTitle:string;
  LabelEventCategory:string;
  LabelEventLocation:string;
  LabelEventAllDay:string;
  LabelEventStartDate:string;
  LabelEventEndDate:string;
  LabelEventDescription:string;
  //Tooltips
  TooltipCancel:string;
  TooltipEdit:string;
  TooltipSave:string;
  TooltipDelete:string;
}

declare module 'ModernEventsWebPartStrings' {
  const strings: IModernEventsWebPartStrings;
  export = strings;
}