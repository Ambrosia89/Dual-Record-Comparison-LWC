/*-- @description:
    * This is a template for a custom LWC component that compares fields from two records from a Lead and an Account.
    * The fields are arranged row-by-row with column and row labels.
    * For each row, the user can select the field thye are interested in retaining/mapping.
    * The functionality of this component is similar to the native Merge Cases feature on Salesforce.   
    * It is a generic implementation that can be adapted for use with different records from different objects.
@params: Input => object1 (Lead record), object2 (Account record).
@returns: Output => object2 (Account record) updated with selected field Mappings.
===============================================================================================
Version             Author                Date            Description                
===============================================================================================
1.0                 Ambrose Akpoyomare    09/05/2024      Initial Development
*/

import { LightningElement, track, api, wire } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";
//Use this to get the RecordTypeId for HLE Clients
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
//Import Account Fields
import ACCOUNT_NAME_FIELD from "@salesforce/schema/Account.Name";
import ACCOUNT_SOURCE_FIELD from "@salesforce/schema/Account.AccountSource";
import ACCOUNT_TYPE_FIELD from "@salesforce/schema/Account.Type";
import ACCOUNT_PHONE_FIELD from "@salesforce/schema/Account.Phone";
import ACCOUNT_BILLINGCITY_FIELD from "@salesforce/schema/Account.BillingCity";
import ACCOUNT_BILLINGCOUNTRY_FIELD from "@salesforce/schema/Account.BillingCountry";
import ACCOUNT_BILLINGSTATE_FIELD from "@salesforce/schema/Account.BillingState";
import ACCOUNT_BILLINGSTREET_FIELD from "@salesforce/schema/Account.BillingStreet";
import ACCOUNT_BILLINGPOSTALCODE_FIELD from "@salesforce/schema/Account.BillingPostalCode";
import ACCOUNT_COGNISMID_FIELD from "@salesforce/schema/Account.Company_Cognisim_ID__c"; // Do not use this, it can be used behind the scenes
import ACCOUNT_COMPANYLINKEDIN_FIELD from "@salesforce/schema/Account.Company_LinkedIn__c";
import ACCOUNT_NUMBEROFEMPLOYEES_FIELD from "@salesforce/schema/Account.NumberOfEmployees";
import ACCOUNT_INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";
import ACCOUNT_SIC_FIELD from "@salesforce/schema/Account.Sic";
import ACCOUNT_WEBSITE_FIELD from "@salesforce/schema/Account.Website";
// *********************************************************************//
//                      Import Lead Fields                              //
// *********************************************************************//
//                     Lead general Fields                              //
import LEAD_COMPANYNAME_FIELD from "@salesforce/schema/Lead.Company";
import LEAD_SOURCE_FIELD from "@salesforce/schema/Lead.LeadSource";
import LEAD_TYPE_FIELD from "@salesforce/schema/Lead.Type__c";
import LEAD_WEBSITE_FIELD from "@salesforce/schema/Lead.Website";
import LEAD_NUMBEROFEMPLOYEES_FIELD from "@salesforce/schema/Lead.NumberOfEmployees";
import LEAD_COGNISMCOMPANYID_FIELD from "@salesforce/schema/Lead.Company_Cognism_ID__c"; // Do not use this, it can be used behind the scenes
import LEAD_COGNISMINDUSTRY_FIELD from "@salesforce/schema/Lead.Industry_Cognism__c";
import LEAD_COMPANYLINKEDIN_FIELD from "@salesforce/schema/Lead.Company_Linkedin__c";
import LEAD_COMPANYSICCODE_FIELD from "@salesforce/schema/Lead.Company_SIC_Code__c";
import LEAD_DIAMONDRECORD_FIELD from "@salesforce/schema/Lead.Diamond_Record__c"; // Do not use this, it can be used behind the scenes
//         Lead Fields for HLE Client (HQ)                              //
import LEAD_HQPHONE_FIELD from "@salesforce/schema/Lead.HQ_Phone__c";
import LEAD_HQADDRESS_FIELD from "@salesforce/schema/Lead.Company_HQ_Address__c";
//import LEAD_HQSTREET_FIELD from "@salesforce/schema/Lead.Company_HQ_Address__Street__s";
//import LEAD_HQCITY_FIELD from "@salesforce/schema/Lead.Company_HQ_Address__City__s";
//import LEAD_HQSTATE_FIELD from "@salesforce/schema/Lead.Company_HQ_Address__StateCode__s";
//import LEAD_HQCOUNTRY_FIELD from "@salesforce/schema/Lead.Company_HQ_Address__CountryCode__s";
//import LEAD_HQPOSTALCODE_FIELD from "@salesforce/schema/Lead.Company_HQ_Address__PostalCode__s";
//      Lead Fields for Non-HLE Client (Non-HQ)                         //
import LEAD_COMPANYPHONE_FIELD from "@salesforce/schema/Lead.Company_Phone__c";
import LEAD_COMPANYADDRESS_FIELD from "@salesforce/schema/Lead.Company_Office_Address__c";
//import LEAD_COMPANYSTREET_FIELD from "@salesforce/schema/Lead.Company_Office_Address__Street__s";
//import LEAD_COMPANYCITY_FIELD from "@salesforce/schema/Lead.Company_Office_Address__City__s";
//import LEAD_COMPANYSTATE_FIELD from "@salesforce/schema/Lead.Company_Office_Address__StateCode__s";
//import LEAD_COMPANYCOUNTRY_FIELD from "@salesforce/schema/Lead.Company_Office_Address__CountryCode__s";
//import LEAD_COMPANYPOSTALCODE_FIELD from "@salesforce/schema/Lead.Company_Office_Address__PostalCode__s";

export default class DualRecordComparison extends LightningElement {
  @track selectedValue;
  @track options = [];
  @track differentFields = [];
  @api leadRecord;
  @api accountRecord;
  @api updatedAccountRecord;
  recordTypeId;

  @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
  accountObjectInfo({ error, data }) {
    if (data) {
      const recordTypeInfos = data.recordTypeInfos;

      // Find the Record Type Info based on Developer Name
      const recordTypeInfo = Object.values(recordTypeInfos).find(
        (info) => info.name === "HLE Client"
      );
      if (recordTypeInfo) {
        this.recordTypeId = recordTypeInfo.recordTypeId;
      }
    } else if (error) {
      console.error("Error fetching object info:", error);
    }
  }
  connectedCallback() {
    this.compareFields();
  }

      get hasDifferentFields() {
        return this.differentFields.length > 0;
    }

  compareFields() {
    this.updatedAccountRecord = { ...this.accountRecord };

    let fieldsToCompare = [
      {
        label: "Company Name",
        leadField: LEAD_COMPANYNAME_FIELD.fieldApiName,
        accountField: ACCOUNT_NAME_FIELD.fieldApiName
      },
      {
        label: "Source",
        leadField: LEAD_SOURCE_FIELD.fieldApiName,
        accountField: ACCOUNT_SOURCE_FIELD.fieldApiName
      },
      {
        label: "Type",
        leadField: LEAD_TYPE_FIELD.fieldApiName,
        accountField: ACCOUNT_TYPE_FIELD.fieldApiName
      },
      {
        label: "Industry",
        leadField: LEAD_COGNISMINDUSTRY_FIELD.fieldApiName,
        accountField: ACCOUNT_INDUSTRY_FIELD.fieldApiName
      },
      {
        label: "LinkedIn",
        leadField: LEAD_COMPANYLINKEDIN_FIELD.fieldApiName,
        accountField: ACCOUNT_COMPANYLINKEDIN_FIELD.fieldApiName
      },
      {
        label: "Number of Employees",
        leadField: LEAD_NUMBEROFEMPLOYEES_FIELD.fieldApiName,
        accountField: ACCOUNT_NUMBEROFEMPLOYEES_FIELD.fieldApiName
      },
      {
        label: "SIC Code",
        leadField: LEAD_COMPANYSICCODE_FIELD.fieldApiName,
        accountField: ACCOUNT_SIC_FIELD.fieldApiName
      },
      {
        label: "Website",
        leadField: LEAD_WEBSITE_FIELD.fieldApiName,
        accountField: ACCOUNT_WEBSITE_FIELD.fieldApiName
      }
    ];

    if (this.accountRecord.RecordTypeId === this.recordTypeId) {
      fieldsToCompare.push(
        {
          label: "Phone",
          leadField: LEAD_HQPHONE_FIELD.fieldApiName,
          accountField: ACCOUNT_PHONE_FIELD.fieldApiName
        },
        {
          label: "Street",
          leadField: `${LEAD_HQADDRESS_FIELD.fieldApiName}.street`, //LEAD_HQADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGSTREET_FIELD.fieldApiName
        },
        {
          label: "City",
          leadField: `${LEAD_HQADDRESS_FIELD.fieldApiName}.city`, //LEAD_HQADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGCITY_FIELD.fieldApiName
        },
        {
          label: "State",
          leadField: `${LEAD_HQADDRESS_FIELD.fieldApiName}.state`, //LEAD_HQADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGSTATE_FIELD.fieldApiName
        },
        {
          label: "Country",
          leadField: `${LEAD_HQADDRESS_FIELD.fieldApiName}.country`, //LEAD_HQADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGCOUNTRY_FIELD.fieldApiName
        },
        {
          label: "Postal Code",
          leadField: `${LEAD_HQADDRESS_FIELD.fieldApiName}.postalCode`, //LEAD_HQADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGPOSTALCODE_FIELD.fieldApiName
        }
      );
    } else {
      fieldsToCompare.push(
        {
          label: "Phone",
          leadField: LEAD_COMPANYPHONE_FIELD.fieldApiName,
          accountField: ACCOUNT_PHONE_FIELD.fieldApiName
        },
        {
          label: "Street",
          leadField: `${LEAD_COMPANYADDRESS_FIELD.fieldApiName}.street`, //LEAD_COMPANYADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGSTREET_FIELD.fieldApiName
        },
        {
          label: "City",
          leadField: `${LEAD_COMPANYADDRESS_FIELD.fieldApiName}.city`, //LEAD_COMPANYADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGCITY_FIELD.fieldApiName
        },
        {
          label: "State",
          leadField: `${LEAD_COMPANYADDRESS_FIELD.fieldApiName}.state`, //LEAD_COMPANYADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGSTATE_FIELD.fieldApiName
        },
        {
          label: "Country",
          leadField: `${LEAD_COMPANYADDRESS_FIELD.fieldApiName}.country`, //LEAD_COMPANYADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGCOUNTRY_FIELD.fieldApiName
        },
        {
          label: "Postal Code",
          leadField: `${LEAD_COMPANYADDRESS_FIELD.fieldApiName}.postalCode`, //LEAD_COMPANYADDRESS_FIELD.fieldApiName,
          accountField: ACCOUNT_BILLINGPOSTALCODE_FIELD.fieldApiName
        }
      );
    }

    // Iterate through the fields and compare their values
    fieldsToCompare.forEach((field, index) => {
      const leadValue = this.getNestedFieldValue(
        this.leadRecord,
        field.leadField
      ); //this.leadRecord[field.leadField];
      const accountValue = this.accountRecord[field.accountField];
      // Generate a unique ID by concatenating the lead ID with the iteration index
      const uniqueIdLead = `${this.leadRecord.Id}-${index}`;
      const uniqueIdAccount = `${this.accountRecord.Id}-${index}`;

      // If values are different, add to differentFields
      if (leadValue !== accountValue) {
        this.differentFields.push({
          name: field.label,
          accountField: field.accountField,
          leadField: field.leadField,
          leadUniqueId: uniqueIdLead,
          accountUniqueId: uniqueIdAccount,
          option1: leadValue,
          option2: accountValue
        });
      }
    });
  }

  getNestedFieldValue(record, fieldPath) {
    if (!fieldPath.includes(".")) {
      return record[fieldPath];
    }

    const fieldParts = fieldPath.split(".");
    let value = record;
    for (const part of fieldParts) {
      value = value ? value[part] : null;
    }
    return value;
  }

  handleSelected(event) {
    const selectedOption = event.target.value;
    const optionId = event.target.dataset.option;

    // Find the corresponding field in fieldsToCompare based on the inputId
    const fieldToCompare = this.differentFields.find(
      (field) =>
        field.leadUniqueId === optionId || field.accountUniqueId === optionId
    );

    // Update the corresponding field in the accountRecord
    if (fieldToCompare) {
      this.updatedAccountRecord[fieldToCompare.accountField] = selectedOption;
      this.accountRecord = this.updatedAccountRecord;

      // Emit a FlowAttributeChangeEvent to notify the Flow of the updated accountRecord
      const attributeChangeEvent = new FlowAttributeChangeEvent(
        "accountRecord",
        this.updatedAccountRecord
      );

      this.dispatchEvent(attributeChangeEvent);
    }
  }
}