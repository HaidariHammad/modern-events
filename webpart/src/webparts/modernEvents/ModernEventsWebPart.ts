import * as React from 'react';
import * as ReactDom from 'react-dom';
import { escape } from '@microsoft/sp-lodash-subset';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneDropdownOption, PropertyPaneDropdown, PropertyPaneCheckbox, PropertyPaneLabel, PropertyPaneButton, PropertyPaneButtonType } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { Placeholder, IPlaceholderProps } from "@pnp/spfx-controls-react/lib/Placeholder";
import * as strings from 'ModernEventsWebPartStrings';
//import { element } from 'prop-types';
import { CalendarApp, ICalendarAppProps } from './components/CalendarApp';
import "./sass/style.scss";
import { DisplayType } from './components/ENUMDisplayType';
//import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { SiteConnector, ISPList } from './services/SiteConnector';
import { string } from 'prop-types';
import { IFieldMap } from   './components/IFieldMap';
import { Feature } from '@pnp/sp/src/features';
//import { RectangleEdge } from 'office-ui-fabric-react/lib/utilities/positioning';

export interface IModernEventsWebPartProps {
  site: string;
  siteOther: string;
  listTitle: string;
  description: string;
  commandbar: boolean;
  viewMonth: boolean;
  viewWeek: boolean;
  viewList: boolean;
  timeformat: string;
  custListTitle: string;
  custListCategory: string;
  custListLocation: string;
  custListStart: string;
  custListEnd: string;
  custListDescription: string;
  custListAllDayEvent: string;
  interactionEventClick: boolean;
  interactionEventDragDrop: boolean;
  supportCustomList: boolean;

}
export default class ModernEventsWebPart extends BaseClientSideWebPart<IModernEventsWebPartProps> {
  private _siteOptions: IPropertyPaneDropdownOption[] = [];
  private _listOptions: IPropertyPaneDropdownOption[] = [];
  private _textColumnOptions: IPropertyPaneDropdownOption[] = [];
  private _dateColumnOptions: IPropertyPaneDropdownOption[] = [];
  private _multilineColumnOptions: IPropertyPaneDropdownOption[] = [];
  private _categoryColumnOptions: IPropertyPaneDropdownOption[] = [];
  private _yesnoColumnOptions: IPropertyPaneDropdownOption[] = [];
  private _listDisabled = true;
  private _otherDisabled = true;

  public render(): void {
    if (
      (!this.properties.supportCustomList && this.properties.site && this.properties.listTitle)
      ||
      (this.properties.supportCustomList && this.properties.site && this.properties.listTitle &&
        this.properties.custListTitle && this.properties.custListLocation && this.properties.custListCategory && this.properties.custListDescription && this.properties.custListStart && this.properties.custListEnd && this.properties.custListAllDayEvent
      )
    ) {
      let fieldMap:IFieldMap = (this. properties.supportCustomList)? {"isDefaultSchema":false,"EventDate":this.properties.custListStart,"EndDate":this.properties.custListEnd,"Title":this.properties.custListTitle,"fAllDayEvent":this.properties.custListAllDayEvent,"Description":this.properties.custListDescription,"Location":this.properties.custListDescription,"Category":this.properties.custListCategory}:{"isDefaultSchema":true,"EventDate":"EventDate","EndDate":"EndDate","Title":"Title","fAllDayEvent":"fAllDayEvent","Description":"Description","Location":"Location","Category":"Category"};

      const app: React.ReactElement<ICalendarAppProps> = React.createElement(
        CalendarApp,
        {
          fieldMapping:fieldMap,
          context: this.context,
          remoteSiteUrl: this.properties.site,
          relativeLibOrListUrl: "/lists/" + this.properties.listTitle,
          displayType: DisplayType.WeekGrid,
          listName: this.properties.listTitle,
          timeformat: this.properties.timeformat,
          commandBarVisible: this.properties.commandbar,
          commandBarButtonVisibility: {
            month: this.properties.viewMonth,
            time: this.properties.viewWeek,
            list: this.properties.viewList
          },
          interactions: {
            dateClickNew: !this.properties.interactionEventClick ? this.properties.interactionEventClick : true,
            dragAndDrop: !this.properties.interactionEventDragDrop ? this.properties.interactionEventDragDrop : true
          }
        }
      );
      ReactDom.render(app, this.domElement);
    } else {
      const configure: React.ReactElement<IPlaceholderProps> = React.createElement(
        Placeholder, {
          iconName: strings.LabelConfigIconName,
          iconText: strings.LabelConfigIconText,
          description: strings.LabelConfigIconDescription,
          buttonLabel: strings.LabelConfigBtnLabel,
          onConfigure: this._onConfigureWebpart.bind(this)
        }
      );
      ReactDom.render(configure, this.domElement);
    }

  }

  private _onConfigureWebpart() {
    this.context.propertyPane.open();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected onPropertyPaneConfigurationStart(): void {
    let con: SiteConnector = new SiteConnector(this.context);
    con.getSiteRootWeb().then((rootweb) => {
      con.getSites(rootweb['Url']).then((sitesResult) => {
        var sites: IPropertyPaneDropdownOption[] = [];
        sites.push({ key: this.context.pageContext.web.absoluteUrl, text: 'This Site' });
        // sites.push({ key: 'other', text: 'Other Site (Specify Url)' });
        for (var _key in sitesResult.value) {
          if (this.context.pageContext.web.absoluteUrl != sitesResult.value[_key]['Url']) {
            sites.push({ key: sitesResult.value[_key]['Url'], text: sitesResult.value[_key]['Title'] });
          }
        }
        this._siteOptions = sites;
        this.context.propertyPane.refresh();
        //let siteUrl = this.properties.site;
        if (this.properties.site) {
          con.getListTitlesByTemplate(this.properties.site, "100").then((listTitleResult) => {
            this._listOptions = listTitleResult.value.map((list: ISPList) => {
              return {
                key: list.Title,
                text: list.Title
              };
            });
            this.context.propertyPane.refresh();
            this.render();
          });
        } else {
          this.context.propertyPane.refresh();

          this.render();
        }
      });
    });
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if (newValue == 'other') {
      this._otherDisabled = false;
      this.properties.listTitle = null;
    } else if (oldValue === 'other' && newValue != 'other') {
      this._otherDisabled = true;
      this.properties.siteOther = null;
      this.properties.listTitle = null;
    } else if (propertyPath == 'supportCustomList') {
      //  this.properties.listTitle = null;
    }
    let con: SiteConnector = new SiteConnector(this.context);
    if (
      ((propertyPath === 'site' || propertyPath === 'other') && newValue) || (propertyPath == 'supportCustomList')) {
      this._listDisabled = true;
      let listType: string = this.properties.supportCustomList ? "100" : "106";
      con.getListTitlesByTemplate(this.properties.site, listType).then((listTitleResult) => {
        this._listOptions = listTitleResult.value.map((list: ISPList) => {
          return {
            key: list.Title,
            text: list.Title
          };
        });
        this._listDisabled = false;
        this.context.propertyPane.refresh();
        this.render();
      });
    } else if (propertyPath == 'listTitle') {
      const isCustomList = !this.properties.supportCustomList ? false : this.properties.supportCustomList;
      if (isCustomList) {
        const _that = this;
        con.getEventListColumns(this.properties.listTitle, this.properties.site).then((columns) => {
          this._dateColumnOptions = [];
          this._textColumnOptions = [];
          this._categoryColumnOptions = [];
          this._multilineColumnOptions = [];
          columns.value.forEach(element => {
            switch (element.FieldTypeKind) {
              case 2:
                this._textColumnOptions.push({ key: element.EntityPropertyName, text: element.EntityPropertyName });
                break;
              case 3:
                this._multilineColumnOptions.push({ key: element.EntityPropertyName, text: element.EntityPropertyName });
                break;
              case 4:
                this._dateColumnOptions.push({ key: element.EntityPropertyName, text: element.EntityPropertyName });
                break;
              case 6:
                this._categoryColumnOptions.push({ key: element.EntityPropertyName, text: element.EntityPropertyName });
                break;
              case 8:
                this._yesnoColumnOptions.push({ key: element.EntityPropertyName, text: element.EntityPropertyName });
                break;
            }
          });
          this.context.propertyPane.refresh();
          this.render();
          console.log(columns);
        });
      }
    }


  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private _checkCustomList() {
    console.log('click');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.SiteGroupName,
              groupFields: [
                PropertyPaneDropdown('site', {
                  label: strings.LabelSite,
                  options: this._siteOptions
                }),
                PropertyPaneCheckbox('supportCustomList', {
                  text: strings.LabelUseCustomList,
                  checked: false,
                  disabled: false
                }),
                PropertyPaneDropdown('listTitle', {
                  label: strings.LabelListTitle,
                  options: this._listOptions,
                  disabled: this._listDisabled
                }),
                PropertyPaneLabel('', {
                  text: strings.LabelCustListFieldMap
                }),
                PropertyPaneDropdown('custListTitle', {
                  label: strings.LabelCustListTitle,
                  options: this._textColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                PropertyPaneDropdown('custListCategory', {
                  label: strings.LabelCustListCategory,
                  options: this._categoryColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                PropertyPaneDropdown('custListLocation', {
                  label: strings.LabelCustListLocation,
                  options: this._textColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                PropertyPaneDropdown('custListStart', {
                  label: strings.LabelCustListStart,
                  options: this._dateColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                PropertyPaneDropdown('custListEnd', {
                  label: strings.LabelCustListEnd,
                  options: this._dateColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                PropertyPaneDropdown('custListDescription', {
                  label: strings.LabelCustListDescription,
                  options: this._multilineColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                PropertyPaneDropdown('custListAllDayEvent', {
                  label: strings.LabelCustListAllDayEvent,
                  options: this._yesnoColumnOptions,
                  disabled: (this.properties.supportCustomList && this.properties.listTitle != "") ? false : true
                }),
                /*
                PropertyPaneTextField('siteOther', {
                  label: strings.LabelSiteOther,
                  ariaLabel: "otherSiteAria",
                  disabled: this._otherDisabled

                }),*/
              ]
            },
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneDropdown('timeformat', {
                  selectedKey: "24h",
                  label: strings.LabelTimeformat,
                  options: [{ key: '24h', text: '24 Hours' }, { key: '12h', text: '12 Hours AM/PM' }],
                  disabled: false
                })
              ]
            },
            {
              groupName: strings.InteractionGroupName,
              groupFields: [
                PropertyPaneCheckbox('interactionEventClick', {
                  text: strings.LabelInterActionEventClickNew,
                  checked: true,
                  disabled: false
                }),
                PropertyPaneCheckbox('interactionEventDragDrop', {
                  text: strings.LabelInterActionEventDragDrop,
                  checked: true,
                  disabled: false
                }),
              ]
            },
            {
              groupName: strings.CommandbarGroupName,
              groupFields: [
                PropertyPaneCheckbox('commandbar', {
                  text: strings.LabelCommandbar,
                  checked: false
                }),
                PropertyPaneLabel('viewMonth', {
                  text: strings.LabelViewButtons
                }),
                PropertyPaneCheckbox('viewMonth', {
                  text: strings.LabelViewMonth,
                  checked: false,
                  disabled: !this.properties.commandbar
                }),
                PropertyPaneCheckbox('viewWeek', {
                  text: strings.LabelViewWeek,
                  checked: false,
                  disabled: !this.properties.commandbar
                }),
                PropertyPaneCheckbox('viewList', {
                  text: strings.LabelViewList,
                  checked: false,
                  disabled: !this.properties.commandbar
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
