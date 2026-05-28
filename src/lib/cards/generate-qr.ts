import QRCode from "qrcode";

export interface QrOptions {
  width?: number;
}

export async function generateQrSvg(url: string, options: QrOptions = {}): Promise<string> {
  const width = options.width ?? 120;
  return QRCode.toString(url, {
    type: "svg",
    width,
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0A0A0A", light: "#FAFAFA" },
  });
}
