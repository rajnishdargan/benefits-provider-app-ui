import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";


interface ImagePreviewProps {
  imageSrc: string[];
  docType: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageSrc, docType, isOpen, onClose }) => {
  const multipleImages = imageSrc.length > 1;

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={imageSrc.map((src) => ({ src, title: docType ?? "Image" }))}
      plugins={[Zoom, Counter, Captions]}
      counter={{ container: { style: { top: "unset", bottom: 0 } } }}
      zoom={{
        maxZoomPixelRatio: 5,
        scrollToZoom: true,
      }}
      carousel={{
        finite: true,
      }}
      render={{
        buttonPrev: multipleImages ? undefined : () => null,
        buttonNext: multipleImages ? undefined : () => null,
      }}
    />
  );
};

export default ImagePreview;
