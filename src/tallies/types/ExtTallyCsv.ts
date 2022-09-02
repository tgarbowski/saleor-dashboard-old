export interface ExtTallyCsv_error{
    message: string
}

export interface ExtTallyCsv{
    errors: ExtTallyCsv_error[]
}

export interface ExtTallyCsvVariables{
    month: string;
    year: string;
}