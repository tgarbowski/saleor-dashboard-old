import { CircularProgress, DialogContentText } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { DeleteIcon, IconButton, makeStyles } from "@saleor/macaw-ui";
import classNames from "classnames";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ActionDialog from "../ActionDialog";

const useStyles = makeStyles(
  theme => ({
    media: {
      height: "100%",
      objectFit: "contain",
      userSelect: "none",
      width: "100%"
    },
    mediaContainer: {
      "&:hover, &.dragged": {
        "& $mediaOverlay": {
          display: "block"
        }
      },
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(),
      height: 148,
      overflow: "hidden",
      padding: theme.spacing(2),
      position: "relative",
      width: 148
    },
    mediaOverlay: {
      background: "rgba(0, 0, 0, 0.6)",
      cursor: "move",
      display: "none",
      height: 148,
      left: 0,
      position: "absolute",
      top: 0,
      width: 148
    },
    mediaOverlayShadow: {
      "&mediaOverlay": {
        alignItems: "center",
        display: "flex",
        justifyContent: "center"
      }
    },
    mediaOverlayToolbar: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }),
  { name: "MediaTile" }
);

interface MediaTileProps {
  media: {
    alt: string;
    url: string;
    type?: string;
    oembedData?: string;
  };
  loading?: boolean;
  onDelete?: () => void;
  onRetrieveFromBackup?: () => void;
  onEdit?: (event: React.ChangeEvent<any>) => void;
}

const MediaTile: React.FC<MediaTileProps> = props => {
  const { loading, onDelete, onEdit, media } = props;
  const classes = useStyles(props);
  const parsedMediaOembedData = media?.oembedData
    ? JSON.parse(media.oembedData)
    : null;
  const mediaUrl = parsedMediaOembedData?.thumbnail_url || media.url;

  const [isDeleting, setIsDeleting] = useState(false);
  const intl = useIntl();

  return (
    <div className={classes.mediaContainer} data-test-id="product-image">
      <div
        className={classNames(classes.mediaOverlay, {
          [classes.mediaOverlayShadow]: loading
        })}
      >
        {loading ? (
          <CircularProgress size={32} />
        ) : (
          <div className={classes.mediaOverlayToolbar}>
            {onEdit && (
              <IconButton variant="secondary" color="primary" onClick={onEdit}>
                <EditIcon />
              </IconButton>
            )}
            {onDelete && (
              <IconButton color="primary" onClick={() => setIsDeleting(true)}>
                <DeleteIcon />
              </IconButton>
            )}
            <ActionDialog
              onClose={() => setIsDeleting(false)}
              onConfirm={() => {
                onDelete();
                setIsDeleting(false);
              }}
              open={isDeleting}
              title={intl.formatMessage({
                defaultMessage: "Delete Image",
                description: "dialog header"
              })}
              variant="delete"
            >
              <DialogContentText>
                <FormattedMessage defaultMessage="Are you sure you want to delete this image?" />
              </DialogContentText>
            </ActionDialog>
          </div>
        )}
      </div>
      <img className={classes.media} src={mediaUrl} alt={media.alt} />
    </div>
  );
};
MediaTile.displayName = "MediaTile";
export default MediaTile;
