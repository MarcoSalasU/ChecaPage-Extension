function extractFeatures(url) {
  const a = document.createElement("a");
  a.href = url;

  return [
    // 1. IP address
    /\d+\.\d+\.\d+\.\d+/.test(a.hostname) ? 1 : -1,

    // 2. URL length
    url.length < 54 ? -1 : url.length <= 75 ? 0 : 1,

    // 3. URL shortening service
    /(bit\.ly|goo\.gl|tinyurl\.com|ow\.ly|t\.co)/.test(url) ? 1 : -1,

    // 4. @ symbol
    url.includes("@") ? 1 : -1,

    // 5. double slash redirecting
    url.indexOf("//") > 7 ? 1 : -1,

    // 6. prefix/suffix "-"
    a.hostname.includes("-") ? 1 : -1,

    // 7. Subdomain count
    a.hostname.split(".").length - 2 >= 3 ? 1 : (a.hostname.split(".").length - 2 === 2 ? 0 : -1),

    // 8. SSL final state (mock)
    url.startsWith("https://") ? 1 : -1,

    // 9. Domain registration length (placeholder)
    -1, // no JS way to verify this

    // 10. Favicon from external domain (placeholder)
    -1, // simplified fallback

    // 11. Port in URL
    a.port && a.port !== "80" && a.port !== "443" ? 1 : -1,

    // 12. HTTPS token in domain
    a.hostname.includes("https") ? 1 : -1,

    // 13. Request URL (placeholder)
    -1, // external requests require DOM fetch

    // 14. Anchor URLs (placeholder)
    -1, // can't check without page content

    // 15. Links in tags (placeholder)
    -1, // same

    // 16. SFH (Server Form Handler) — placeholder
    -1,

    // 17. Submitting to email
    url.includes("mailto:") ? 1 : -1,

    // 18. Abnormal URL
    a.hostname.match(/[0-9]{5,}|[a-z]{30,}/) ? 1 : -1,

    // 19. Redirect count (approximate via // count)
    (url.match(/\/\//g) || []).length > 3 ? 1 : -1,

    // 20. onmouseover (needs DOM)
    -1,

    // 21. RightClick disabled (not testable from static URL)
    -1,

    // 22. Popup window (can't detect from URL)
    -1,

    // 23. Iframe usage (needs DOM)
    -1,

    // 24. Age of domain (placeholder)
    -1,

    // 25. DNSRecord existence (not checkable from JS)
    -1,

    // 26. Web traffic — proxy via known domains
    /(facebook|google|youtube|amazon|microsoft|gov)/.test(a.hostname) ? -1 : 1,

    // 27. PageRank — can't be checked, assume low
    1,

    // 28. Google index (placeholder)
    -1,

    // 29. Links pointing to page (not testable here)
    -1,

    // 30. Statistical reports (based on suspicious pattern)
    /(login|secure|account|update)/.test(url) ? 1 : -1
  ];
}
