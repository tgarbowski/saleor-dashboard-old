import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { commonMessages } from "@saleor/intl";
import { extractMutationErrors } from "@saleor/misc";
import OrderReturnPage from "@saleor/orders/components/OrderReturnPage";
import { OrderReturnFormData } from "@saleor/orders/components/OrderReturnPage/form";
import { useOrderReturnCreateMutation } from "@saleor/orders/mutations";
import { useOrderQuery } from "@saleor/orders/queries";
import { orderUrl } from "@saleor/orders/urls";
import { OrderErrorCode } from "@saleor/types/globalTypes";
import React from "react";
import { defineMessages } from "react-intl";
import { useIntl } from "react-intl";

import ReturnFormDataParser from "./utils";

export const messages = defineMessages({
  cannotRefundDescription: {
    defaultMessage:
      "Napotkaliśmy problem podczas refundacji produktów. Produkty nie zostały zwrócone. Prosimy spróbować ponownie.",
    description: "order return error description when cannot refund"
  },
  cannotRefundTitle: {
    defaultMessage: "Nie można było dokonać zwrotu pieniędzy za produkty",
    description: "order return error title when cannot refund"
  },
  successAlert: {
    defaultMessage: "Produkty zostały pomyślnie zwrócone!",
    description: "order returned success message"
  }
});

interface OrderReturnProps {
  orderId: string;
}

const OrderReturn: React.FC<OrderReturnProps> = ({ orderId }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();

  const { data, loading } = useOrderQuery({
    displayLoader: true,
    variables: {
      id: orderId
    }
  });

  const [returnCreate, returnCreateOpts] = useOrderReturnCreateMutation({
    onCompleted: ({
      orderFulfillmentReturnProducts: { errors, replaceOrder }
    }) => {
      if (!errors.length) {
        notify({
          status: "success",
          text: intl.formatMessage(messages.successAlert)
        });

        navigateToOrder(replaceOrder?.id);

        return;
      }

      if (errors.some(err => err.code === OrderErrorCode.CANNOT_REFUND)) {
        notify({
          autohide: 5000,
          status: "error",
          text: intl.formatMessage(messages.cannotRefundDescription),
          title: intl.formatMessage(messages.cannotRefundTitle)
        });

        return;
      }

      notify({
        autohide: 5000,
        status: "error",
        text: intl.formatMessage(commonMessages.somethingWentWrong)
      });
    }
  });

  const handleSubmit = async (formData: OrderReturnFormData) => {
    if (!data?.order) {
      return;
    }

    return extractMutationErrors(
      returnCreate({
        variables: {
          id: data.order.id,
          input: new ReturnFormDataParser(data.order, formData).getParsedData()
        }
      })
    );
  };

  const navigateToOrder = (id?: string) => navigate(orderUrl(id || orderId));

  return (
    <OrderReturnPage
      errors={returnCreateOpts.data?.orderFulfillmentReturnProducts.errors}
      order={data?.order}
      loading={loading || returnCreateOpts.loading}
      onSubmit={handleSubmit}
      onBack={() => navigateToOrder()}
    />
  );
};

OrderReturn.displayName = "OrderReturn";
export default OrderReturn;
