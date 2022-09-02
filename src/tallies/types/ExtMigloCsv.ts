export interface ExtMigloCsv_error{
    message: string
}

export interface ExtMigloCsv{
    errors: ExtMigloCsv_error[]
}

export interface ExtMigloCsvVariables{
    month: string;
    year: string;
}