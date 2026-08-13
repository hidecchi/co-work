import { receiptAccessKey, receiptConfig } from "../config/receipt";
import { siteConfig } from "../config/site";

type ReceiptData = {
  issuedAt: string;
  storeName: string;
  address: string;
  amount: number;
  description: string;
  taxNote: string;
};

function formatJstNow(): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function buildReceiptData(): ReceiptData {
  const { postalCode, addressRegion, addressLocality, streetAddress } =
    siteConfig.business;

  return {
    issuedAt: formatJstNow(),
    storeName: siteConfig.name,
    address: `〒${postalCode} ${addressRegion}${addressLocality}${streetAddress}`,
    amount: receiptConfig.amount,
    description: receiptConfig.description,
    taxNote: receiptConfig.taxNote,
  };
}

function buildReceiptHtml(data: ReceiptData): string {
  const amount = data.amount.toLocaleString("ja-JP");

  return `
    <div class="receipt">
      <h1 class="receipt__title">
        <span>領</span><span>収</span><span>書</span>
      </h1>
      <div class="receipt__amount-row">
        <span class="receipt__amount-label">金額</span>
        <span class="receipt__amount">¥${amount}</span>
      </div>
      <p class="receipt__tax-note">${data.taxNote}</p>
      <div class="receipt__body">
        <p class="receipt__description">但し　${data.description}として</p>
        <p class="receipt__statement">上記正に領収いたしました。</p>
      </div>
      <dl class="receipt__meta">
        <dt>発行日時</dt>
        <dd>${data.issuedAt}（日本時間）</dd>
        <dt>発行元</dt>
        <dd>${data.storeName}<br>${data.address}</dd>
      </dl>
    </div>
  `;
}

export function initReceiptPage(): void {
  const app = document.getElementById("receipt-app");
  const denied = document.getElementById("receipt-denied");
  const preview = document.getElementById("receipt-preview");
  const printBtn = document.getElementById("receipt-print");

  if (!app || !denied || !preview || !printBtn) {
    return;
  }

  const key = new URLSearchParams(window.location.search).get("key");

  if (key !== receiptAccessKey) {
    app.hidden = true;
    return;
  }

  preview.innerHTML = buildReceiptHtml(buildReceiptData());
  window.history.replaceState(null, "", window.location.pathname);

  app.hidden = false;
  denied.hidden = true;

  printBtn.addEventListener("click", () => {
    window.print();
  });
}
