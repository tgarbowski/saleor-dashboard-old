import { DialogContentText } from "@material-ui/core";
import ActionDialog from "@saleor/components/ActionDialog";
import NotFoundPage from "@saleor/components/NotFoundPage";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { commonMessages } from "@saleor/intl";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import ProductMediaPage from "../components/ProductMediaPage";
import {
  useProductMediaDeleteMutation,
  useProductMediaUpdateMutation,
  useProductMediaRetrievefromBackupMutation
} from "../mutations";
import { useProductMediaQuery } from "../queries";
import {
  productImageUrl,
  ProductImageUrlQueryParams,
  productListUrl,
  productUrl
} from "../urls";

interface ProductMediaProps {
  mediaId: string;
  productId: string;
  params: ProductImageUrlQueryParams;
}

export const ProductImage: React.FC<ProductMediaProps> = ({
  mediaId,
  productId,
  params
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();

  const handleBack = () => navigate(productUrl(productId));

  const { data, loading } = useProductMediaQuery({
    displayLoader: true,
    variables: {
      mediaId,
      productId
    }
  });

  const [updateImage, updateResult] = useProductMediaUpdateMutation({
    onCompleted: data => {
      if (data.productMediaUpdate.errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges)
        });
      }
    }
  });

  const [deleteImage, deleteResult] = useProductMediaDeleteMutation({
    onCompleted: handleBack
  });

  const [retrieveProductImageFromBackup, retrieveStatus] = useProductMediaRetrievefromBackupMutation({
    onCompleted: () => navigate(productImageUrl(productId, mediaId))
  });

  const product = data?.product;

  if (product === null) {
    return <NotFoundPage onBack={() => navigate(productListUrl())} />;
  }

  const handleImageRetrieveFromBackup = () => retrieveProductImageFromBackup({ variables: { id: mediaId } });  
  const handleDelete = () => deleteImage({ variables: { id: mediaId } });
  const handleImageClick = (id: string) => () =>
    navigate(productImageUrl(productId, id));
  const handleUpdate = (formData: { description: string }) => {
    updateImage({
      variables: {
        alt: formData.description,
        id: mediaId
      }
    });
  };
  const mediaObj = data?.product?.mainImage;

  return (
    <>
      <ProductMediaPage
        disabled={loading}
        product={data?.product?.name}
        mediaObj={mediaObj || null}
        media={data?.product?.media}
        onBack={handleBack}
        onDelete={() =>
          navigate(
            productImageUrl(productId, mediaId, {
              action: "remove"
            })
          )
        }
        onImageRetrieveFromBackup={() =>
          navigate(
            productImageUrl(productId, mediaId, {
              action: "retrieve"
            })
          )
        }
        onRowClick={handleImageClick}
        onSubmit={handleUpdate}
        saveButtonBarState={updateResult.status}
      />
      <ActionDialog
        onClose={() =>
          navigate(productImageUrl(productId, mediaId), { replace: true })
        }
        onConfirm={handleDelete}
        open={params.action === "remove"}
        title={intl.formatMessage({
          defaultMessage: "Delete Image",
          description: "dialog header"
        })}
        variant="delete"
        confirmButtonState={deleteResult.status}
      >
        <DialogContentText>
          <FormattedMessage defaultMessage="Are you sure you want to delete this image?" />
        </DialogContentText>
      </ActionDialog>

      <ActionDialog
        onClose={() => navigate(productImageUrl(productId, mediaId), { replace: true })}
        onConfirm={handleImageRetrieveFromBackup}
        open={params.action === "retrieve"}
        title={intl.formatMessage({
          defaultMessage: "Retrieve from backup",
          description: "dialog header"
        })}
        confirmButtonState={retrieveStatus.status}
      >
        <DialogContentText>
          <FormattedMessage defaultMessage="Are you sure you want to retrieve image from backup?" />
        </DialogContentText>
      </ActionDialog>


    </>
  );
};
export default ProductImage;
