// @ts-ignore
import appsIcon from "@assets/images/menu-apps-icon.svg";
import catalogIcon from "@assets/images/menu-catalog-icon.svg";
import configurationIcon from "@assets/images/menu-configure-icon.svg";
import customerIcon from "@assets/images/menu-customers-icon.svg";
import discountsIcon from "@assets/images/menu-discounts-icon.svg";
import homeIcon from "@assets/images/menu-home-icon.svg";
import ordersIcon from "@assets/images/menu-orders-icon.svg";
import pagesIcon from "@assets/images/menu-pages-icon.svg";
import translationIcon from "@assets/images/menu-translation-icon.svg";
import warehouseIcon from "@assets/images/warehouse-icon.svg";
import {
  configurationMenuUrl
} from "@saleor/configuration";
import { getConfigMenuItemsPermissions } from "@saleor/configuration/utils";
import { User } from "@saleor/fragments/types/User";
import { commonMessages, sectionNames } from "@saleor/intl";
import { SidebarMenuItem } from "@saleor/macaw-ui";
import {
  warehouseListPath,
  wmsDocumentsListPath
} from "@saleor/warehouses/urls";
import { pageListPath } from "@saleor/pages/urls";
import { IntlShape } from "react-intl";
import { appsListPath } from "../../apps/urls";
import { categoryListUrl } from "../../categories/urls";
import { collectionListUrl } from "../../collections/urls";
import { customerListUrl } from "../../customers/urls";
import { saleListUrl, voucherListUrl } from "../../discounts/urls";
import { orderDraftListUrl, orderListUrl } from "../../orders/urls";
import { productListUrl } from "../../products/urls";
import { languageListUrl } from "../../translations/urls";
import { PermissionEnum } from "../../types/globalTypes";

interface FilterableMenuItem extends Omit<SidebarMenuItem, "children"> {
  children?: FilterableMenuItem[];
  permissions?: PermissionEnum[];
}

function createMenuStructure(intl: IntlShape, user: User): SidebarMenuItem[] {

  const menuItems: FilterableMenuItem[] = [
    {
      ariaLabel: "home",
      iconSrc: homeIcon,
      label: intl.formatMessage(sectionNames.home),
      id: "home",
      url: "/"
    },
    {
      ariaLabel: "catalogue",
      children: [
        {
          ariaLabel: "products",
          label: intl.formatMessage(sectionNames.products),
          id: "products",
          url: productListUrl()
        },
        {
          ariaLabel: "categories",
          label: intl.formatMessage(sectionNames.categories),
          id: "categories",
          url: categoryListUrl()
        },
        {
          ariaLabel: "collections",
          label: intl.formatMessage(sectionNames.collections),
          id: "collections",
          url: collectionListUrl()
        }
      ],
      iconSrc: catalogIcon,
      label: intl.formatMessage(commonMessages.catalog),
      permissions: [
        PermissionEnum.MANAGE_GIFT_CARD,
        PermissionEnum.MANAGE_PRODUCTS
      ],
      id: "catalogue"
    },
    {
      ariaLabel: "orders",
      children: [
        {
          ariaLabel: "orders",
          label: intl.formatMessage(sectionNames.orders),
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "orders",
          url: orderListUrl()
        },
        {
          ariaLabel: "order drafts",
          label: intl.formatMessage(commonMessages.drafts),
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "order-drafts",
          url: orderDraftListUrl()
        }
      ],
      iconSrc: ordersIcon,
      label: intl.formatMessage(sectionNames.orders),
      permissions: [PermissionEnum.MANAGE_ORDERS],
      id: "orders"
    },
    {
      ariaLabel: "customers",
      iconSrc: customerIcon,
      label: intl.formatMessage(sectionNames.customers),
      permissions: [PermissionEnum.MANAGE_USERS],
      id: "customers",
      url: customerListUrl()
    },

    {
      ariaLabel: "discounts",
      children: [
        {
          ariaLabel: "sales",
          label: intl.formatMessage(sectionNames.sales),
          id: "sales",
          url: saleListUrl()
        },
        {
          ariaLabel: "vouchers",
          label: intl.formatMessage(sectionNames.vouchers),
          id: "vouchers",
          url: voucherListUrl()
        }
      ],
      iconSrc: discountsIcon,
      label: intl.formatMessage(commonMessages.discounts),
      permissions: [PermissionEnum.MANAGE_DISCOUNTS],
      id: "discounts"
    },
    {
      ariaLabel: "pages",
      iconSrc: pagesIcon,
      label: intl.formatMessage(sectionNames.pages),
      permissions: [PermissionEnum.MANAGE_PAGES],
      id: "pages",
      url: pageListPath
    },
    {
      ariaLabel: "apps",
      iconSrc: appsIcon,
      label: intl.formatMessage(sectionNames.apps),
      permissions: [PermissionEnum.MANAGE_APPS],
      id: "apps",
      url: appsListPath
    },
    {
      ariaLabel: "translations",
      iconSrc: translationIcon,
      label: intl.formatMessage(sectionNames.translations),
      permissions: [PermissionEnum.MANAGE_TRANSLATIONS],
      id: "translations",
      url: languageListUrl
    },
    {
      ariaLabel: "configure",
      iconSrc: configurationIcon,
      label: intl.formatMessage(sectionNames.configuration),
      permissions: getConfigMenuItemsPermissions(intl),
      id: "configure",
      url: configurationMenuUrl
    },
    {
      ariaLabel: "warehouses",
      id: "warehouses",
      iconSrc: warehouseIcon,
      label: intl.formatMessage(sectionNames.warehouses),
      permissions: [PermissionEnum.MANAGE_PRODUCTS],
      children: [
        {
          ariaLabel: "warehouses_details",
          label: intl.formatMessage(sectionNames.warehouses),
          id: "warehouses_details",
          url: warehouseListPath
        },
        {
          ariaLabel: "wms_documents",
          label: intl.formatMessage(sectionNames.wmsDocuments),
          id: "wms_documents",
          url: wmsDocumentsListPath
        }
      ],
    }
  ];

  return menuItems.filter(
    menuItem =>
      !menuItem.permissions ||
      (user?.userPermissions || []).some(permission =>
        menuItem.permissions.includes(permission.code)
      )
  );
}

export default createMenuStructure;
