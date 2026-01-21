import { useState, useMemo } from "preact/hooks";
import { bech32 } from "bech32";
import { clientConfig } from "../shared/client-config.ts";
import { bytesToString } from "../shared/utils.ts";

export default function Donation() {
  const [type, setType] = useState<"lnurl-pay" | "bolt11">("lnurl-pay");
  const [invoice, setInvoice] = useState<string | undefined>(undefined);

  const lnurlPayBech32 = useMemo(() => {
    if (!clientConfig.donation) return "";
    return bech32.encode("lnurl", bech32.toWords(new TextEncoder().encode(clientConfig.donation.lnurlPayUrl)), 1024);
  }, []);

  if (!clientConfig.donation) {
    return null;
  }

  const showLnUrlPay = () => {
    setType("lnurl-pay");
    setInvoice(lnurlPayBech32);
  };

  const decodeLnUrlPay = async () => {
    const decodedBech32 = bech32.decode(invoice!, 1024);
    const decodedUrl = bytesToString(bech32.fromWords(decodedBech32.words));

    const result = await fetch(decodedUrl);
    const resultJson = await result.json();

    const amount = prompt(
      `Choose an amount between ${resultJson.minSendable} sats and ${resultJson.maxSendable} sats`,
      resultJson.minSendable
    );

    const amountNumber = Number.parseInt(amount!) * 1000;

    if (Number.isNaN(amountNumber)) {
      return;
    }

    const callback = resultJson.callback;

    const resultCallback = await fetch(callback + "?amount=" + amountNumber);
    const resultCallbackJson = await resultCallback.json();

    setType("bolt11");
    setInvoice(resultCallbackJson.pr);
  };

  const onClickInvoice = () => {
    if (typeof window !== "undefined") {
      window.location.replace("lightning:" + invoice);
    }
  };

  return (
    <div class="donate-container">
      {!invoice && (
        <a class="donate-text" onClick={showLnUrlPay}>
          Donate via Lightning Network
        </a>
      )}
      {invoice && (
        <>
          <p class="invoice-text">
            {type === "lnurl-pay" && <>LNURL-pay</>}
            {type === "bolt11" && <>LN Invoice</>} QR code:
          </p>
          <div style={{ cursor: "pointer", textAlign: "center" }} onClick={onClickInvoice}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${invoice.toUpperCase()}`}
              alt="QR Code"
              style={{ border: "8px solid #fff", width: "200px" }}
            />
          </div>
          <a class="bolt11-text" onClick={onClickInvoice}>{invoice}</a>
          {type === "lnurl-pay" && (
            <a class="change-to-bolt11" onClick={decodeLnUrlPay}>
              Unsupported wallet? Click to change to normal BOLT11 invoice
            </a>
          )}
          {clientConfig.donation?.lightningNodeUri && (
            <>
              <p class="connect-to-node-title">The Lightning Node:</p>
              <p class="connect-to-node-data">{clientConfig.donation.lightningNodeUri}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
