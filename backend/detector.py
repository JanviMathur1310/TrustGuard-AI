import re
from urllib.parse import urlparse


def detect_threats(text):
    """
    Analyze text for common scam indicators.
    Returns a list of detected indicators.
    """

    text = text.lower()
    indicators = []

    # 1. Urgency / pressure
    urgency_patterns = [
        r"\burgent\b",
        r"\bimmediately\b",
        r"\bact now\b",
        r"\bwithin \d+ (minutes?|hours?)\b",
        r"\blast warning\b",
        r"\baccount will be blocked\b",
        r"\baccount will be suspended\b"
    ]

    if any(re.search(pattern, text) for pattern in urgency_patterns):
        indicators.append("Urgency or pressure")

    # 2. OTP / verification requests
    otp_patterns = [
        r"\botp\b",
        r"\bone[- ]time password\b",
        r"\bverification code\b",
        r"\bshare.*code\b",
        r"\bsend.*otp\b"
    ]

    if any(re.search(pattern, text) for pattern in otp_patterns):
        indicators.append("OTP or verification-code request")

    # 3. Payment / money requests
    payment_patterns = [
        r"\bsend money\b",
        r"\btransfer money\b",
        r"\bpay now\b",
        r"\bmake a payment\b",
        r"\bpay.*fee\b",
        r"\bprocessing fee\b",
        r"\bupi\b",
        r"\bpayment\b"
    ]

    if any(re.search(pattern, text) for pattern in payment_patterns):
        indicators.append("Payment or money request")

    # 4. Link detection
    url_pattern = r"https?://[^\s]+|www\.[^\s]+"

    urls = re.findall(url_pattern, text)

    # Websites that we will treat as safe for our prototype
    safe_domains = {
        "google.com",
        "www.google.com",
        "youtube.com",
        "www.youtube.com",
        "microsoft.com",
        "www.microsoft.com",
        "amazon.com",
        "www.amazon.com"
    }

    suspicious_link_found = False

    for url in urls:
        clean_url = url.rstrip(".,!?;:)")

        if not clean_url.startswith(("http://", "https://")):
            clean_url = "https://" + clean_url

        try:
            parsed = urlparse(clean_url)
            domain = parsed.netloc.lower()

            # Remove www. for comparison
            domain = domain.replace("www.", "")

            if domain not in {
                d.replace("www.", "") for d in safe_domains
            }:
                suspicious_link_found = True

        except Exception:
            suspicious_link_found = True

    if suspicious_link_found:
        indicators.append("Contains a suspicious link")

    # 5. Banking / KYC content
    bank_patterns = [
        r"\bbank\b",
        r"\bkyc\b",
        r"\baccount verification\b",
        r"\bcredit card\b",
        r"\bdebit card\b",
        r"\bnet banking\b"
    ]

    if any(re.search(pattern, text) for pattern in bank_patterns):
        indicators.append("Banking or KYC-related content")

    # 6. Prize / reward scams
    reward_patterns = [
        r"\byou have won\b",
        r"\bcongratulations\b",
        r"\bprize\b",
        r"\breward\b",
        r"\blottery\b",
        r"\bcashback\b"
    ]

    if any(re.search(pattern, text) for pattern in reward_patterns):
        indicators.append("Prize or reward claim")

    # 7. Sensitive information requests
    personal_info_patterns = [
        r"\bpassword\b",
        r"\bpin\b",
        r"\bcard number\b",
        r"\bcvv\b",
        r"\bpan number\b",
        r"\baadhaar\b"
    ]

    if any(re.search(pattern, text) for pattern in personal_info_patterns):
        indicators.append("Request for sensitive information")

    return indicators


# Test the detector
if __name__ == "__main__":

    test_message = """
    URGENT! Your bank account will be blocked.
    Verify your KYC immediately and share your OTP.
    """

    results = detect_threats(test_message)

    print("Detected indicators:")

    for indicator in results:
        print("-", indicator)