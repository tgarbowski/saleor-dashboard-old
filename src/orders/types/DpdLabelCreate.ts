/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: LabelCreate
// ====================================================

export interface Label_labelCreate {
  label: string;
}

  export interface Label {
    labelCreate:  Label_labelCreate;
  }
  
  export interface Label_input {
      packageId: number;
  }
  
  export interface LabelVariables {
    input: Label_input;
  }