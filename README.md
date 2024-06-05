# Dual-Record-Comparison-LWC
Description 
    * This is a the HTML template for a custom LWC component that compares fields from two records from a Lead and an Account.
    * The fields are arranged row-by-row with column and row labels.
    * For each row, the user can select the field thye are interested in retaining/mapping.
    * The functionality of this component is similar to the native Merge Cases feature on Salesforce.   
    * It is a generic implementation that can be adapted for use with different records from different objects.
@params: Input => object1 (Lead record), object2 (Account record), mappingFields (array of mapped fields), 
          fieldsDifferent (array of different fields), description (custom description to display).
@returns: Output => object2 (Account record) updated with selected field Mappings.

An example of the output is shown below

![image](https://github.com/Ambrosia89/Dual-Record-Comparison-LWC/assets/127087811/225c5946-634f-430a-9c48-48390c7b601f)
