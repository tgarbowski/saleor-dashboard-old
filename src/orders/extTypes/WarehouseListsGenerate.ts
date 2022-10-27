import { OrderFilterInput } from "@saleor/types/globalTypes";

export interface warehouseListsGenerateVariables {
  filters: OrderFilterInput;
}

export interface warehouseListsGenerate {
  warehouseListsGenerate: warehouseListsGenerate_warehouseListsGenerate;
}

export interface warehouseListsGenerate_warehouseListsGenerate {
  warehouseList: string;
  wmsList: string;
}
